# Layer 2 - Frontend Applications

## Overview

This layer implements mobile-first React applications for both donors and organizations, with strict color schemes for visual distinction.

## Applications

### 1. Donor App (`donor-app/`)
- **Color Scheme**: Amber (consistent throughout the entire journey)
- **Primary Users**: Bakeries, restaurants, supermarkets
- **Core Feature**: Listing Form
  - Camera integration (direct camera access on tap)
  - AI-filled fields that users can manually edit
  - Entire flow must complete in 60 seconds
  - Simple form without complex authentication

### 2. Organization App (`org-app/`)
- **Color Scheme**: Teal (consistent throughout the entire journey)
- **Primary Users**: Food banks, rescue organizations, food pantries
- **Core Features**:
  1. **Live Listing Board**: Real-time available food listings (WebSocket)
  2. **Our Needs**: Post what they're looking for
  3. **Gap Map**: Interactive heat map showing demand coverage
  4. **Alerts**: Actionable demand alerts with explanations

### 3. Shared Components (`shared-components/`)
- Common UI components used across both apps
- Utilities and helpers
- Theming system (with Amber and Teal variants)

## Design Principles

- **Mobile-First**: All designs assume smartphone-first layouts
- **No Account Friction**: Users authenticate via postcode + organization code only
- **Explainability**: AI alerts must explain the "why" (e.g., "Month-end pressure spike detected")
- **Real-Time Updates**: Use WebSocket for live data synchronization

## Technology Stack

- **Framework**: React 18+
- **Styling**: TailwindCSS (with custom theme configs for Amber/Teal)
- **State Management**: TBD (Redux, Zustand, or Context API)
- **Real-Time**: WebSocket for live listing updates
- **Build Tool**: Vite

## Getting Started

More details coming in Phase 3 of development.

---

**Status**: Under Development
