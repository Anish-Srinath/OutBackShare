import React, { Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Pages - Donor Flow
import HomePage from './pages/HomePage'
import PostcodeInputPage from './pages/PostcodeInputPage'
import PostFeedPage from './pages/PostFeedPage'
import DonationFormPage from './pages/DonationFormPage'
import DonorDashboardPage from './pages/DonorDashboardPage'
import DonorHotspotsPage from './pages/DonorHotspotsPage'
// HotspotMap retired — /donor/hotspots now redirects to Area Intelligence

// Pages - Organization Flow
import OrgCodeInputPage from './pages/OrgCodeInputPage'
import RegisterPage from './pages/RegisterPage'
import LiveListingBoard from './pages/LiveListingBoard'
import OrgAlertsPage from './pages/OrgAlertsPage'
import OrgSupplyGapPage from './pages/OrgSupplyGapPage'
import OrgIntelligencePage from './pages/OrgIntelligencePage'
import CoverageGapMap from './pages/CoverageGapMap'

class MapErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
          <strong>Map render error:</strong>
          <pre style={{ marginTop: '1rem', color: 'red', whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

function AppRoutes() {
  return (
    <Routes>
      {/* Home page - role selection */}
      <Route path="/" element={<HomePage />} />
      <Route path="/roles" element={<HomePage />} />

      {/* Donor flow: workspace -> post / hotspots / listings */}
      <Route path="/postcode" element={<PostcodeInputPage />} />
      <Route path="/donor" element={<DonorDashboardPage />} />
      <Route path="/donor/post" element={<DonationFormPage />} />
      <Route path="/donor/listings" element={<PostFeedPage />} />
      <Route path="/donor/hotspots" element={<Navigate to="/org/intelligence" replace />} />
      <Route path="/feed/:postcode" element={<PostFeedPage />} />
      <Route path="/hotspots/:postcode" element={<DonorHotspotsPage />} />

      {/* Form with optional postcode param so we can redirect back to feed */}
      <Route path="/form/:postcode" element={<DonationFormPage />} />
      <Route path="/form" element={<DonationFormPage />} />

      {/* Organization flow: code -> listings + alerts */}
      <Route path="/register/:role" element={<RegisterPage />} />
      <Route path="/org/code" element={<OrgCodeInputPage />} />
      <Route path="/org/listings" element={<LiveListingBoard />} />
      <Route path="/org/intelligence" element={<OrgIntelligencePage />} />
      <Route path="/org/alerts" element={<Navigate to="/org/intelligence" replace />} />
      <Route path="/org/gaps" element={<Navigate to="/org/intelligence" replace />} />
      <Route path="/org/coverage-map" element={<MapErrorBoundary><CoverageGapMap /></MapErrorBoundary>} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
