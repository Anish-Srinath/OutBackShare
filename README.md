# OutBackShare-AI

> AI-powered food relief coordination platform for regional Victoria & NSW, Australia.  
> Built as part of Monash University FIT5120 Industry Experience Studio — Semester 1, 2026.

---

## Overview

Over 33% of households in regional Australia face food insecurity, yet surplus food from donors frequently goes unclaimed due to poor coordination infrastructure. OutBackShare-AI bridges this gap by connecting food donors with volunteer-run food relief organisations — using computer vision, demand forecasting, and multilingual support to make the process fast, accessible, and data-driven.

The platform serves two primary users:
- **Food Donors** (e.g. bakeries, farms, supermarkets) who list surplus food
- **Volunteer Coordinators** who manage claims on behalf of food pantries and community organisations

---

## Features

| Feature | Description |
|---|---|
| AI Donation Form | SegFormer computer vision model auto-detects food type from a photo upload |
| Demand Forecast Panel | Random Forest model generates 4-week demand projections per region |
| Postcode Coverage Map | SEIFA-weighted gap detection highlights underserved postcodes |
| Multilingual Interface | Full UI support for English, Mandarin, Vietnamese and Arabic |
| Organisation Onboarding | Orgs set food type preferences, dietary tags and service postcode on registration |
| In-App Messaging | Anonymous, claim-scoped messaging between donor and coordinator |
| Live Listing Board | Real-time view of available donations with status tracking |

**Listing status pipeline:** `Available → Claimed → Collected / Expired`

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                    Users                        │
│        Volunteer Coordinator · Food Donor       │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│              Frontend  (React + Tailwind)        │
│  Coordinator Dashboard · Donor View             │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│              Backend  (Python / FastAPI)         │
│  Listing · Onboarding · Messaging               │
│  Translation · Security Services                │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│              AI Engine  (PyTorch / scikit-learn) │
│  SegFormer · K-Means · Random Forest            │
│  Postcode Gap Detector                          │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│                    Data                         │
│  PostgreSQL · ABS SEIFA 2021 · ABS Census 2021  │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

**Frontend:** React, Tailwind CSS  
**Backend:** Python, FastAPI  
**Database:** PostgreSQL  
**AI/ML:** PyTorch (SegFormer), scikit-learn (Random Forest, K-Means)  
**Translation:** LibreTranslate  
**Project Management:** LeanKit (Kanban)

---

## My Contributions

This repository represents my personal contributions to the OutBackShare-AI platform across all three build iterations.

**Security**
- Designed and implemented platform-wide security: HTTPS enforcement, rate limiting, input sanitisation, and postcode-only user identification to protect anonymity on a public-facing platform
- Applied Security by Design principles from Iteration 1 — security was not retrofitted but embedded into service architecture

**Feature Development (Iteration 3)**
- Built the **Organisation Onboarding** feature (US 6.1) end-to-end: REST API endpoint, `org_preferences` PostgreSQL table, and React onboarding flow capturing food type preferences, dietary tags and service postcode
- Built the **In-App Messaging** feature (US 7.1 & 7.2): claim-scoped anonymous messaging service with read receipts, `messages` table schema, and frontend message thread UI

**Architecture & Planning**
- Designed and maintained the formal System Architecture Diagram across all iterations
- Authored Agile acceptance criteria for all user stories in Epics 6 and 7
- Administered the team LeanKit Kanban board for a 6-person cross-functional team throughout the semester
- Contributed to MoSCoW prioritisation and feature descoping decisions to manage delivery risk

---

## Database Schema (Key Tables)

```sql
-- Organisation preferences (US 6.1)
org_preferences (
  org_id        UUID REFERENCES organisations,
  food_types    TEXT[],
  dietary_tags  TEXT[],
  postcode      VARCHAR(4)
)

-- Claim-scoped messaging (US 7.1 / 7.2)
messages (
  message_id  UUID PRIMARY KEY,
  claim_id    UUID REFERENCES claims,
  sender_type VARCHAR(20),   -- 'coordinator' | 'donor'
  content     TEXT,
  sent_at     TIMESTAMP,
  read_at     TIMESTAMP
)
```

---

## Team

6-person multidisciplinary team — Monash University FIT5120, Semester 1 2026.

---

## Disclaimer

This project was developed for academic purposes as part of Monash University's Industry Experience Studio unit (FIT5120). It is not a commercial product.
