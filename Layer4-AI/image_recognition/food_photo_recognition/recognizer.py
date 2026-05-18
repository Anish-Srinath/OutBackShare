"""
recognizer.py

Loads the convonext_tiny trained weights once at startup via
get_recognizer() and exposes a single predict(image_path) method.
"""

import gc
import sys
import io
import json
import os
import tempfile
import zipfile
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dino_counter import get_dino_counter

import torch
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image

from lookup_tables import get_info

# Limit BLAS/OpenMP thread pools — saves ~200MB on small CPU instances
# (Railway Hobby tier) where multi-thread parallelism isn't helpful anyway.
torch.set_num_threads(1)

# Cap incoming image size before tensor conversion to keep peak memory low.
# 512 is well above the model's 224 input requirement; transforms.Resize(256)
# will further shrink it inside the pipeline.
MAX_PIL_DIM = 512

def_model_dir = Path(__file__).parent / "models"
def_wgths = def_model_dir / "best_food101_convnext.pth"
def_classes = def_model_dir / "classes.json"

N_CLASSES = 101

img_transforms = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean = [0.485, 0.456, 0.406],
        std = [0.229, 0.224, 0.225]
    )
])

class FoodRecognizer:
    """
    Loads ConvNeXt-Tiny at init and keeps it in memory for the
    lifetime of the server process.
    Usage:
        recognizer = FoodRecognizer()
        result = recognizer.predict(image_bytes)
    """
    def __init__(self, model_pth=None, classes_pth=None, confidence_threshold = 0.7):
        self.confidence_threshold = confidence_threshold

        model_pth, classes_pth = resolve_model_paths(model_pth, classes_pth)

        # Download artifacts from release assets if missing (Railway / Docker
        # deploys ship without the weight files, which are pulled at startup).
        ensure_bundle_available(model_pth, classes_pth, os.getenv("MODEL_BUNDLE_URL"))
        ensure_file_available(classes_pth, os.getenv("MODEL_CLASSES_URL"), "classes metadata")
        ensure_file_available(model_pth, os.getenv("MODEL_WEIGHTS_URL"), "model weights")

        with open(classes_pth) as f:
            self.classes = json.load(f)

        self.model = self.load_model(model_pth)
        print(f"FoodRecognizer ready — model: {model_pth.name}")

        # Load Grounding DINO for quantity counting
    
        try:
            self.dino_counter = get_dino_counter()
        except Exception as e:
            print(f"Warning: DINO failed to load: {e}. Quantity counting disabled.")
            self.dino_counter = None

    def load_model(self,weights_pth):
        model = models.convnext_tiny(weights=None)
        model.classifier[2] = torch.nn.Linear(768, N_CLASSES)
        state_dict = torch.load(weights_pth, map_location="cpu")
        model.load_state_dict(state_dict)
        model.eval()
        return model

    def to_pil(self, image_inp):
        """
        Convert the input to a PIL Image regardless of its file type for
        error free handling. Downsamples large images in PIL space first
        so the subsequent tensor pipeline never sees the full-resolution
        bitmap — keeps inference peak memory predictable.
        """

        if isinstance(image_inp, bytes):
            img = Image.open(io.BytesIO(image_inp)).convert("RGB")
        elif isinstance(image_inp, (str , Path)):
            img = Image.open(str(image_inp)).convert("RGB")
        elif isinstance(image_inp, Image.Image):
            img = image_inp.convert("RGB")
        else:
            raise TypeError(f"Unsupported image type: {type(image_inp)}")

        # In-place downsample if either dimension exceeds MAX_PIL_DIM
        # (e.g. 4000×3000 phone photo → ~512×384 thumbnail).
        if max(img.size) > MAX_PIL_DIM:
            img.thumbnail((MAX_PIL_DIM, MAX_PIL_DIM), Image.LANCZOS)
        return img

    
            
    def predict(self, image_inp):
        """
        Runs inference on one image and return the autofill payload.
        """
        img = self.to_pil(image_inp)
        tensor = img_transforms(img).unsqueeze(0)

        # inference_mode is the modern replacement for no_grad and skips
        # version-counter tracking → smaller activation footprint.
        with torch.inference_mode():
            logits = self.model(tensor)
            probs = F.softmax(logits, dim=1)

            top_probs, top_indices = torch.topk(probs, k=3, dim=1)

            top_probs = top_probs[0].tolist()
            top_indices = top_indices[0].tolist()

            top1_raw = self.classes[top_indices[0]]
            top1_conf = top_probs[0]
            top1_info = get_info(top1_raw)

            name_suggestions = [
                get_info(self.classes[idx])["display_name"]
                for idx in top_indices
            ]

        # Release intermediate tensors before the (potentially heavy) DINO
        # branch so they don't sit in memory through that call.
        del tensor, logits, probs

        # Count items with DINO (runs its own no_grad block internally)
        # Only runs if the food class has a dino_prompt in the lookup table
        dino_prompt = top1_info["dino_prompt"]
        if dino_prompt is not None and self.dino_counter is not None:
            quantity = self.dino_counter.count(img, dino_prompt)
        else:
            quantity = None

        # Force GC so torch's CPU caching allocator hands memory back to the
        # OS — critical on tight-RAM hosts (Railway Hobby) where idle memory
        # creep eventually trips the OOM killer.
        gc.collect()

        return {
            "name": top1_info["display_name"],
            "name_suggestions": name_suggestions,
            "quantity": quantity,
            "tags": top1_info["tags"],
            "confidence": round(top1_conf, 4),
            "raw_class": top1_raw,
            "dino_prompt": dino_prompt,
        }
            
recognizer_instance = None

def get_recognizer(model_pth=None, classes_pth=None, confidence_threshold = 0.7):
    """
     Get (or create) the global FoodRecognizer instance.

    We do it once when the server starts, then every request
    calls .predict() on the already-loaded instance saving time and memory
    """
    global recognizer_instance
    if recognizer_instance is None:
        recognizer_instance = FoodRecognizer(model_pth, classes_pth, confidence_threshold)
    return recognizer_instance


def resolve_model_paths(model_pth=None, classes_pth=None):
    """Resolve model artifact paths from args, env vars, or defaults."""
    model_dir_env = os.getenv("MODEL_DIR", "").strip()
    model_dir = Path(model_dir_env) if model_dir_env else def_model_dir

    weights_path_env = os.getenv("MODEL_WEIGHTS_PATH", "").strip()
    classes_path_env = os.getenv("MODEL_CLASSES_PATH", "").strip()

    resolved_model = Path(model_pth) if model_pth else (
        Path(weights_path_env) if weights_path_env else model_dir / "best_food101_convnext.pth"
    )
    resolved_classes = Path(classes_pth) if classes_pth else (
        Path(classes_path_env) if classes_path_env else model_dir / "classes.json"
    )
    return resolved_model, resolved_classes


def ensure_bundle_available(weights_path, classes_path, bundle_url):
    """
    If both artifacts are missing AND MODEL_BUNDLE_URL is configured,
    download a zip and extract it. Expected to contain best_food101_convnext.pth
    and classes.json at the root.
    """
    if weights_path.exists() and classes_path.exists():
        return
    source = (bundle_url or "").strip()
    if not source:
        return

    target_dir = weights_path.parent
    target_dir.mkdir(parents=True, exist_ok=True)

    print(f"Downloading model bundle from {source} ...")
    req = Request(source, headers={"User-Agent": "CrisisLink-listing-service"})
    tmp_zip = None
    try:
        with urlopen(req, timeout=240) as resp:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp:
                tmp.write(resp.read())
                tmp_zip = Path(tmp.name)
        with zipfile.ZipFile(tmp_zip, "r") as zf:
            zf.extractall(target_dir)
    except (HTTPError, URLError, TimeoutError, zipfile.BadZipFile) as e:
        raise RuntimeError(f"Failed to download/extract model bundle from {source}: {e}") from e
    finally:
        if tmp_zip and tmp_zip.exists():
            try: tmp_zip.unlink()
            except OSError: pass

    if not weights_path.exists() or not classes_path.exists():
        raise FileNotFoundError(
            f"Model bundle extracted but expected files missing in '{target_dir}': "
            f"'{weights_path.name}' and '{classes_path.name}'."
        )


def ensure_file_available(file_path, source_url, label):
    """Download a single artifact from URL when configured and not on disk."""
    if file_path.exists():
        return
    source = (source_url or "").strip()
    if not source:
        raise FileNotFoundError(
            f"Missing {label} at '{file_path}'. "
            "Set MODEL_BUNDLE_URL, MODEL_DIR / MODEL_*_PATH, or MODEL_*_URL."
        )

    file_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {label} from {source} ...")
    req = Request(source, headers={"User-Agent": "CrisisLink-listing-service"})
    try:
        with urlopen(req, timeout=180) as resp, open(file_path, "wb") as out:
            out.write(resp.read())
    except (HTTPError, URLError, TimeoutError) as e:
        raise RuntimeError(f"Failed to download {label} from {source}: {e}") from e

    
        
             
        