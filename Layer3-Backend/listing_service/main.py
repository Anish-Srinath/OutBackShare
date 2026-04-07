"""
Listing Service - FastAPI application for managing food listings
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

app = FastAPI(
    title="CrisisLink Listing Service",
    description="API for creating and managing food listings",
    version="0.1.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Data Models ============

class ListingCreate(BaseModel):
    """Model for creating a new listing"""
    foodType: str
    quantity: float
    unit: str = "portions"
    postcode: str
    orgCode: str
    description: Optional[str] = None
    photoUrl: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "foodType": "Bread, Pastries",
                "quantity": 5,
                "unit": "boxes",
                "postcode": "3000",
                "orgCode": "ABC123",
                "description": "Fresh baked this morning",
                "photoUrl": "https://..."
            }
        }

class Listing(ListingCreate):
    """Model for a listing response"""
    id: str
    createdAt: datetime
    status: str = "available"  # available, claimed, expired
    claimedBy: Optional[str] = None
    claimedAt: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "uuid-xxx",
                "foodType": "Bread, Pastries",
                "quantity": 5,
                "unit": "boxes",
                "postcode": "3000",
                "orgCode": "ABC123", 
                "description": "Fresh baked this morning",
                "photoUrl": "https://...",
                "createdAt": "2026-04-07T10:30:00",
                "status": "available",
                "claimedBy": None,
                "claimedAt": None
            }
        }

class ClaimRequest(BaseModel):
    """Model for claiming a listing"""
    orgId: str
    orgName: Optional[str] = None

class ImageRecognitionResult(BaseModel):
    """Model for image recognition response"""
    foodType: str
    quantity: Optional[float] = None
    confidence: float
    description: Optional[str] = None

# ============ Mock Database ============

# TODO: Replace with actual database (PostgreSQL)
listings_db = {}

# ============ Routes ============

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "listing-service"}

@app.post("/listings", response_model=Listing)
async def create_listing(listing: ListingCreate):
    """
    Create a new food listing
    
    - **foodType**: Type of food being donated
    - **quantity**: Amount of food
    - **unit**: Unit of measurement
    - **postcode**: Postcode where food is available
    - **orgCode**: Organization code for authentication
    """
    listing_id = str(uuid.uuid4())
    
    new_listing = {
        "id": listing_id,
        **listing.dict(),
        "createdAt": datetime.now(),
        "status": "available",
        "claimedBy": None,
        "claimedAt": None
    }
    
    listings_db[listing_id] = new_listing
    
    # TODO: Trigger matching service to find suitable organizations
    # TODO: Push notifications to matching organizations
    
    return new_listing

@app.get("/listings", response_model=list[Listing])
async def get_listings(
    postcode: Optional[str] = None,
    foodType: Optional[str] = None,
    status: str = "available"
):
    """
    Get listings with optional filters
    
    - **postcode**: Filter by postcode
    - **foodType**: Filter by food type
    - **status**: Filter by status (available, claimed, expired)
    """
    results = []
    
    for listing in listings_db.values():
        if listing["status"] != status:
            continue
        if postcode and listing["postcode"] != postcode:
            continue
        if foodType and foodType.lower() not in listing["foodType"].lower():
            continue
        results.append(listing)
    
    # TODO: Sort by creation time (most recent first)
    # TODO: Add real-time WebSocket updates
    
    return results

@app.get("/listings/{listing_id}", response_model=Listing)
async def get_listing(listing_id: str):
    """Get a specific listing by ID"""
    if listing_id not in listings_db:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    return listings_db[listing_id]

@app.post("/listings/{listing_id}/claim", response_model=dict)
async def claim_listing(listing_id: str, claim: ClaimRequest):
    """
    Claim a listing (mark as taken by an organization)
    
    - **listing_id**: ID of the listing to claim
    - **orgId**: ID of the claiming organization
    """
    if listing_id not in listings_db:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    listing = listings_db[listing_id]
    
    if listing["status"] != "available":
        raise HTTPException(
            status_code=400,
            detail=f"Listing is already {listing['status']}"
        )
    
    listing["status"] = "claimed"
    listing["claimedBy"] = claim.orgId
    listing["claimedAt"] = datetime.now()
    
    # TODO: Send confirmation to donor
    # TODO: Log for feedback/training
    
    return {
        "success": True,
        "listing_id": listing_id,
        "claimed_by": claim.orgId,
        "claimed_at": listing["claimedAt"]
    }

@app.patch("/listings/{listing_id}/expire")
async def expire_listing(listing_id: str):
    """Mark a listing as expired"""
    if listing_id not in listings_db:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    listing = listings_db[listing_id]
    listing["status"] = "expired"
    
    return {"success": True, "listing_id": listing_id, "status": "expired"}

# ============ Image Recognition Integration ============

@app.post("/image-recognition/recognize", response_model=ImageRecognitionResult)
async def recognize_food_from_image(image: UploadFile = File(...)):
    """
    Recognize food from uploaded image
    
    This endpoint integrates with Layer 4 AI models:
    - SegFormer for food type and portion detection
    - Google Cloud Vision API as fallback
    """
    if not image:
        raise HTTPException(status_code=400, detail="No image provided")
    
    # TODO: Implement actual image recognition
    # TODO: Call Layer 4 image recognition service
    # TODO: Handle low-confidence results with Vision API fallback
    
    # Mock response for now
    return {
        "foodType": "Bread and Pastries",
        "quantity": 5,
        "confidence": 0.87,
        "description": "Assorted fresh baked goods"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
