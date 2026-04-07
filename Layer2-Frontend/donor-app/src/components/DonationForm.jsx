import React, { useState, useRef } from 'react'
import { recognizeFoodFromImage, submitListing } from '../services/api'
import '../styles/DonationForm.css'

const DonationForm = () => {
  const cameraRef = useRef(null)
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    unit: 'portions',
    postcode: '',
    orgCode: '',
    description: '',
    photoUrl: null
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [timer, setTimer] = useState(60)

  // Start 60-second timer
  React.useEffect(() => {
    if (!success && timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer, success])

  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      // Send image to AI recognition API
      const formDataWithFile = new FormData()
      formDataWithFile.append('image', file)

      const result = await recognizeFoodFromImage(formDataWithFile)
      
      setFormData(prev => ({
        ...prev,
        foodType: result.foodType || '',
        quantity: result.quantity || '',
        photoUrl: URL.createObjectURL(file)
      }))
      setShowCamera(false)
    } catch (err) {
      setError('Failed to process image. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
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
        unit: 'portions',
        postcode: '',
        orgCode: '',
        description: '',
        photoUrl: null
      })
      setTimer(60)

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
      <div className="container-center">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Thank You!</h2>
          <p>Your food listing has been posted successfully.</p>
          <p className="text-sm text-gray-600">Organizations will be notified about your surplus.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="donation-form-container">
      {/* Header */}
      <div className="form-header">
        <h1>Share Your Surplus</h1>
        <div className="timer">
          <span className={timer < 15 ? 'timer-warning' : ''}>
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Photo Section */}
      <div className="photo-section">
        {formData.photoUrl ? (
          <div className="photo-preview">
            <img src={formData.photoUrl} alt="Food" />
            <button 
              type="button" 
              className="btn-secondary text-sm mt-2"
              onClick={() => setFormData(prev => ({ ...prev, photoUrl: null }))}
            >
              Change Photo
            </button>
          </div>
        ) : (
          <div className="camera-placeholder">
            {showCamera ? (
              <div className="camera-capture">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  ref={cameraRef}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => cameraRef.current?.click()}
                >
                  📷 Take Photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-primary text-lg"
                onClick={() => setShowCamera(true)}
              >
                📷 Snap Food Photo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="form-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Food Type */}
        <div className="form-group">
          <label htmlFor="foodType">Food Type *</label>
          <input
            type="text"
            id="foodType"
            name="foodType"
            className="input-field"
            value={formData.foodType}
            onChange={handleInputChange}
            placeholder="e.g., Bread, Pastries, Mixed Vegetables"
            required
          />
          <small className="text-gray-600">AI will auto-fill from your photo</small>
        </div>

        {/* Quantity */}
        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="input-field"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="e.g., 5"
              required
            />
          </div>

          <div className="form-group flex-1 ml-2">
            <label htmlFor="unit">Unit</label>
            <select
              id="unit"
              name="unit"
              className="input-field"
              value={formData.unit}
              onChange={handleInputChange}
            >
              <option value="portions">Portions</option>
              <option value="kg">Kilograms</option>
              <option value="items">Items</option>
              <option value="boxes">Boxes</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            name="description"
            className="input-field"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Fresh baked this morning, gluten-free options available"
            rows="2"
          />
        </div>

        {/* Postcode */}
        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="postcode">Postcode *</label>
            <input
              type="text"
              id="postcode"
              name="postcode"
              className="input-field"
              value={formData.postcode}
              onChange={handleInputChange}
              placeholder="e.g., 3000"
              maxLength="4"
              required
            />
          </div>

          <div className="form-group flex-1 ml-2">
            <label htmlFor="orgCode">Organization Code *</label>
            <input
              type="text"
              id="orgCode"
              name="orgCode"
              className="input-field"
              value={formData.orgCode}
              onChange={handleInputChange}
              placeholder="e.g., ABC123"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary w-full text-lg py-3 mt-4"
          disabled={loading}
        >
          {loading ? 'Posting...' : '✓ Post Now'}
        </button>

        <p className="text-center text-xs text-gray-600 mt-2">
          No account needed. Just postcode & org code.
        </p>
      </form>
    </div>
  )
}

export default DonationForm
