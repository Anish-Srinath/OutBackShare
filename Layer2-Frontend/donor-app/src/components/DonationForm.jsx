import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { recognizeFoodFromImage, submitListing } from '../services/api'
import '../styles/DonationForm.css'

const DonationForm = () => {
  const { postcode } = useParams()
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    postcode: postcode || '',
    orgCode: '',
    photoUrl: null
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)


  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAiProcessing(true)
    setError(null)

    try {
      // Send image to AI recognition API
      const formDataWithFile = new FormData()
      formDataWithFile.append('image', file)

      const result = await recognizeFoodFromImage(formDataWithFile)
      
      setFormData(prev => ({
        ...prev,
        foodType: result.foodType || 'Unknown Food',
        quantity: result.quantity || '1',
        photoUrl: URL.createObjectURL(file)
      }))
    } catch (err) {
      // Fallback: still accept the photo even if AI fails
      setFormData(prev => ({
        ...prev,
        photoUrl: URL.createObjectURL(file),
        foodType: 'Mixed Food Items'
      }))
      setError(null)
    } finally {
      setAiProcessing(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.foodType || !formData.quantity || !formData.postcode || !formData.orgCode) {
        throw new Error('Please fill in all required fields')
      }

      const response = await submitListing(formData)
      
      setSuccess(true)
      setFormData({
        foodType: '',
        quantity: '',
        postcode: '',
        orgCode: '',
        photoUrl: null
      })

      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to submit listing. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Listed!</h2>
          <p>Your food is now visible to local food banks.</p>
          <p className="success-subtext">Thank you for sharing.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="donation-form-container">
      {/* Header */}
      <div className="form-header">
        <button 
          className="btn-back"
          onClick={() => window.history.back()}
        >
          ←
        </button>
        <h1>Post surplus</h1>
        <div></div>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="form-content">
        
        {/* Title Section */}
        <div className="scan-title-section">
          <h2>Scan your food</h2>
          <p>AI fills food type, quantity & tags automatically</p>
        </div>

        {/* Photo Section - MAIN FOCUS */}
        <div className="photo-section">
          {formData.photoUrl ? (
            <div className="photo-preview">
              <img src={formData.photoUrl} alt="Food" />
              <button 
                type="button" 
                className="btn-change-photo"
                onClick={() => setFormData(prev => ({ ...prev, photoUrl: null }))}
              >
                📷 Change photo
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn-take-photo"
                onClick={() => {
                  cameraRef.current?.click()
                }}
              >
                <div className="camera-icon">📷</div>
                <div className="camera-text">
                  <div className="camera-title">Take a photo</div>
                  <div className="camera-subtitle">Tap here — uses your camera</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  ref={cameraRef}
                  style={{ display: 'none' }}
                />
              </button>
              
              <button
                type="button"
                className="btn-upload-gallery"
                onClick={() => {
                  galleryRef.current?.click()
                }}
              >
                ⬆️ Upload from gallery
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCameraCapture}
                  ref={galleryRef}
                  style={{ display: 'none' }}
                />
              </button>
            </>
          )}
          
          {aiProcessing && (
            <div className="ai-processing">
              <div className="spinner">⚙️</div>
              <span>Analyzing food...</span>
            </div>
          )}
        </div>

        {/* AI-Filled Info Display */}
        {formData.foodType && (
          <div className="info-display">
            <div className="info-item">
              <span className="info-label">Food</span>
              <span className="info-value">{formData.foodType}</span>
            </div>
            <div className="info-divider"></div>
            <div className="info-item">
              <span className="info-label">Qty</span>
              <span className="info-value">{formData.quantity}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Location Section */}
        <div className="location-section">
          <div className="location-info">
            <div className="postcode-display">
              <span className="location-icon">📍</span>
              <span className="postcode-value">{postcode}</span>
            </div>
          </div>
          
          <div className="orgcode-input-group">
            <label htmlFor="orgCode">Food Bank Code</label>
            <input
              type="text"
              id="orgCode"
              name="orgCode"
              className="input-field input-orgcode"
              value={formData.orgCode}
              onChange={(e) => setFormData(prev => ({ ...prev, orgCode: e.target.value.toUpperCase() }))}
              placeholder="e.g., FB001"
              maxLength="10"
              required
            />
            <small>Ask the food bank staff for their code</small>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-submit"
          disabled={loading || !formData.foodType || !formData.postcode || !formData.orgCode}
        >
          {loading ? '📤 Posting...' : '✓ Post Now'}
        </button>

        <p className="form-hint">
          No account needed. Your location is only shared with the receiving food bank.
        </p>
      </form>
    </div>
  )
}

export default DonationForm
