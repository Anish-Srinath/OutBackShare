# Layer 4 - AI Engine

## Overview

This layer contains all machine learning models and AI-powered features that drive the intelligence of CrisisLink.

## Components

### 1. Image Recognition (`image_recognition/`)
- **Purpose**: Identify food type and estimate portion size from photos
- **Model**: SegFormer fine-tuned on Food-101 dataset
- **Fallback**: Google Cloud Vision API for low-confidence predictions

### 2. NLP Matching (`nlp_matching/`)
- **Purpose**: Match surplus food descriptions with organizational needs
- **Model**: Sentence Transformer for semantic similarity
- **Dataset**: Trained on donation descriptions and organization needs

### 3. Demand Prediction (`demand_prediction/`)
- **Purpose**: Forecast demand spikes and identify coverage gaps
- **Components**:
  - K-Means clustering for regional postcode grouping
  - Random Forest for weekly risk scoring
- **Features**: SEIFA decile, welfare payment cycles, seasonality, platform activity

## Development Approach

- Models are trained and serialized in their respective directories
- Each service exposes a REST API endpoint for inference
- Models are versioned and registered in `model_registry/`

## Dependencies

```
python>=3.9
tensorflow>=2.10
transformers>=4.20
scikit-learn>=1.0
pandas>=1.3
numpy>=1.21
```

## Getting Started

More details coming in Phase 1 of development.

---

**Status**: Under Development
