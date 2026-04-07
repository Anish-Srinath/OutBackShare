# Layer 3 - Backend Microservices

## Overview

This layer contains the core business logic microservices that coordinate between the frontend, AI engine, and database.

## Microservices

### 1. Listing Service (`listing_service/`)
- **Purpose**: Handle creation, retrieval, and lifecycle of food listings
- **Key Operations**:
  - Create new listing (POST)
  - Get available listings (GET with filters)
  - Claim a listing (PATCH status)
  - Mark as expired (PATCH)
- **Database**: Direct PostgreSQL access for CRUD operations

### 2. Matching Service (`matching_service/`)
- **Purpose**: Match surplus food with organizational needs
- **Key Operations**:
  - Trigger when new listing is posted
  - Call NLP matcher from Layer 4
  - Rank matches by similarity score
  - Push notifications to top-matched organizations
  - Log accepted/rejected matches for model training

### 3. Prediction Service (`prediction_service/`)
- **Purpose**: Generate demand forecasts and alert organizations about coverage gaps
- **Key Operations**:
  - Run weekly (scheduled task)
  - Generate postcode-level risk scores
  - Compare against current supply
  - Surface high-priority alerts

### 4. API Router (`api_router/`)
- Single entry point for frontend requests
- Routes requests to appropriate microservices
- Future evolution path: Can be upgraded to a full API Gateway if needed

## Architecture

```
Frontend
   ↓
API Router (FastAPI)
   ├── /listings → Listing Service
   ├── /matches → Matching Service
   └── /predictions → Prediction Service
   ↓
Shared connectors to AI Engine & Database
```

## Technology Stack

- **Framework**: Python FastAPI
- **Server**: Uvicorn
- **Database**: PostgreSQL (with async driver)
- **AI Integration**: Direct imports from Layer 4

## Getting Started

More details coming in Phase 2 of development.

---

**Status**: Under Development
