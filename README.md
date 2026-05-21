# OutBackShare - Food Relief and Surplus Resource Coordination Platform

> Real-time Food Relief and Surplus Resource Coordination Platform Powered by AI

## 📋 Project Overview

CrisisLink eliminates information barriers by seamlessly connecting surplus food providers (bakeries, restaurants) with community food relief organizations in need.

### Core Users

- **Donors**: Bakeries, restaurants, and businesses with food surplus
- **Organizations**: Food banks, food pantries, and community relief organizations

### Core Value Propositions

- ✨ **Lightning-Fast Posting**: Donors can list surplus food in just 60 seconds
- 🤖 **AI-Powered Recognition**: Snap a photo, and AI automatically identifies food type and quantity
- 🗺️ **Intelligent Matching**: NLP-driven matching between surplus food and organizational needs
- 🚨 **Smart Alerts**: ML-powered demand forecasting and coverage gap visualization
- 🌍 **Multi-Language Support**: Automatic translation breaking down language barriers

---

## 🏗️ System Architecture

The project is organized into 5 layers:

```
Layer 1: Users (Donors & Organizations)
           ↓
Layer 2: Frontend (React - Mobile-First)
           ↓
Layer 3: Backend Microservices (Python FastAPI)
           ├── Listing Service
           ├── Matching Service
           └── Prediction Service
           ↓
Layer 4: AI Engine (Python)
           ├── Image Recognition (SegFormer)
           ├── NLP Matching (Sentence Transformer)
           └── Demand Forecasting (K-Means + Random Forest)
           ↓
Layer 5: Data (PostgreSQL + SEIFA Data + Datasets)
```

See [Architecture Documentation](docs/ARCHITECTURE.md) for details

---

## 📁 Project Structure

```
OutBackShare/
├── Layer5-Data/                    # Data Layer
│   ├── postgresql/                 # Database schema & migrations
│   ├── abs-seifa-data/             # ABS SEIFA 2021 data
│   └── datasets/                   # Training datasets (Food-101, etc.)
│
├── Layer4-AI/                      # AI/ML Engine
│   ├── image_recognition/          # Image recognition models
│   ├── nlp_matching/               # NLP matching engine
│   └── demand_prediction/          # Demand forecasting models
│
├── Layer3-Backend/                 # Backend Microservices
│   ├── api_router/                 # API router
│   ├── listing_service/            # Listing management service
│   ├── matching_service/           # Matching service
│   ├── prediction_service/         # Prediction service
│   └── shared/                     # Shared libraries
│
├── Layer2-Frontend/                # Frontend Applications
│   ├── donor-app/                  # Donor app (Amber theme)
│   ├── org-app/                    # Organization app (Teal theme)
│   └── shared-components/          # Shared components
│
└── docs/                           # Documentation
    ├── ARCHITECTURE.md
    ├── DATABASE_SCHEMA.md
    └── AI_MODELS.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/oceanbrother/Crisislink.git
cd CrisisLink

# Setup instructions for each layer can be found in their respective README.md files
```

---

## 📚 Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [AI Models Documentation](docs/AI_MODELS.md)

---

## 👥 Development Team Structure

- **Frontend & Backend Engineers**: Responsible for Layer 2 & 3
- **Data Engineers**: Responsible for Layer 4 & 5

---

## 📝 Development Roadmap

### Phase 1: Data Preparation & AI Engine (Layer 4 & 5)
- [ ] PostgreSQL schema design
- [ ] SEIFA data import
- [ ] Image recognition model fine-tuning
- [ ] NLP matching engine training
- [ ] Demand forecasting model development

### Phase 2: Backend Microservices (Layer 3)
- [ ] Listing Service development
- [ ] Matching Service development
- [ ] Prediction Service development
- [ ] API Router integration

### Phase 3: Frontend Applications (Layer 2)
- [ ] Donor app form development
- [ ] Organization dashboard development
- [ ] Real-time update integration (WebSocket)

### Phase 4: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] Production deployment

---

## 📄 License

MIT License

---

## 🤝 Contributing

We welcome issues and pull requests!

---

**Last Updated**: April 2026
