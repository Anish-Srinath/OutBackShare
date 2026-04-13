import React, { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { recognizeFoodFromImage, submitListing, uploadImage } from '../services/api'
import '../styles/DonationForm.css'

const CATEGORIES = ['Bakery & Grains', 'Fresh Produce', 'Dairy & Eggs', 'Canned Goods', 'Prepared Meals', 'Other']

const DonationForm = () => {
  const { postcode } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const selectedFileRef = useRef(null)  // holds the actual File for upload on submit

  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    category: 'Bakery & Grains',
    postcode: postcode || '',
    orgCode: '',
    photoUrl: null,
    dietary_tags: [],
    name_suggestions: [],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    selectedFileRef.current = file  // keep a reference for upload on submit
    setAiProcessing(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append('image', file)
      const result = await recognizeFoodFromImage(fd)
      setFormData(prev => ({
        ...prev,
        foodType: result.name || 'Unknown Food',
        quantity: result.quantity != null ? String(result.quantity) : '',
        dietary_tags: result.dietary_tags || [],
        name_suggestions: result.name_suggestions || [],
        photoUrl: URL.createObjectURL(file)
      }))
    } catch {
      setFormData(prev => ({
        ...prev,
        photoUrl: URL.createObjectURL(file),
        foodType: prev.foodType || ''
      }))
    } finally {
      setAiProcessing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.foodType || !formData.quantity || !formData.postcode || !formData.orgCode) {
        throw new Error('Please fill in all required fields')
      }
      // Upload the image first if we have one, to get a permanent URL
      let permanentPhotoUrl = null
      if (selectedFileRef.current) {
        try {
          const uploadResult = await uploadImage(selectedFileRef.current)
          permanentPhotoUrl = uploadResult.url
        } catch {
          // Image upload failed — post without photo rather than blocking submission
          console.warn('Image upload failed, submitting without photo')
        }
      }

      await submitListing({ ...formData, photoUrl: permanentPhotoUrl })
      setSuccess(true)
      setFormData({
        foodType: '', quantity: '', category: 'Bakery & Grains',
        postcode: postcode || '', orgCode: '', photoUrl: null,
        dietary_tags: [], name_suggestions: [],
      })
      // Navigate back to feed after 2 seconds so user sees their listing
      setTimeout(() => {
        if (postcode) {
          navigate(`/feed/${postcode}`)
        } else if (formData.postcode) {
          navigate(`/feed/${formData.postcode}`)
        } else {
          setSuccess(false)
        }
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to submit listing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <h2>Listed!</h2>
          <p>Your food is now visible to local food banks.</p>
          <p className="success-tag">Thank you for sharing.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="donation-form-container">
      {/* Fixed Header */}
      <header className="form-header">
        <div className="form-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-back" onClick={() => postcode ? navigate(`/feed/${postcode}`) : window.history.back()}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <span className="form-brand">CrisisLink</span>
          </div>
          <div className="form-header-badge">
            <span className="material-symbols-outlined">bolt</span>
            AI Assisted Listing
          </div>
        </div>
        <div className="form-header-divider" />
      </header>

      {/* Main form */}
      <form onSubmit={handleSubmit}>
        <main className="form-content">
          {/* Hero */}
          <header className="form-hero">
            <h1>Share Surplus</h1>
            <p>Let AI do the heavy lifting. Just snap a photo of the food you'd like to share.</p>
          </header>

          {/* Upload / Preview */}
          {formData.photoUrl ? (
            <div className="photo-preview">
              <img src={formData.photoUrl} alt="Food" />
              <button
                type="button"
                className="btn-change-photo"
                onClick={() => { setFormData(prev => ({ ...prev, photoUrl: null })); fileInputRef.current.value = '' }}
              >
                <span className="material-symbols-outlined">photo_camera</span>
                Change photo
              </button>
            </div>
          ) : (
            <label className="upload-area">
              <div className="upload-icon-circle">
                <span className="material-symbols-outlined">photo_camera</span>
              </div>
              <div className="upload-title">Take a photo or upload one</div>
              <div className="upload-subtitle">we will fill in the details</div>
              <input
                ref={fileInputRef}
                className="upload-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          )}

          {/* AI processing */}
          {aiProcessing && (
            <div className="ai-processing">
              <span className="material-symbols-outlined spinner-icon">settings</span>
              Analysing food...
            </div>
          )}

          {/* AI Result Card */}
          {formData.foodType && (
            <div className="ai-result-card">
              <div className="ai-result-bg-icon">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div className="ai-result-label">
                <div className="ai-label-icon">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <span className="ai-label-text">AI Generated Details</span>
              </div>

              <div className="ai-fields-grid">
                {/* Food name */}
                <div className="ai-field full">
                  <label className="field-label" htmlFor="foodType">Food Name</label>
                  <input
                    id="foodType"
                    className="form-input"
                    type="text"
                    placeholder="What are you sharing?"
                    value={formData.foodType}
                    onChange={e => setFormData(prev => ({ ...prev, foodType: e.target.value }))}
                  />
                </div>

                {/* Quantity */}
                <div className="ai-field">
                  <label className="field-label" htmlFor="quantity">Estimated Quantity</label>
                  <input
                    id="quantity"
                    className="form-input"
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>

                {/* Category */}
                <div className="ai-field">
                  <label className="field-label" htmlFor="category">Category</label>
                  <div className="form-select-wrapper">
                    <select
                      id="category"
                      className="form-select"
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <span className="material-symbols-outlined select-arrow">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Dietary tags */}
              {formData.dietary_tags.length > 0 && (
                <div className="tags-row">
                  {formData.dietary_tags.map(tag => (
                    <span key={tag} className={`tag-chip tag-${tag.replace(/\s+/g, '-')}`}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && <div className="error-message">{error}</div>}

          {/* Manual fields */}
          <div className="manual-fields">
            <div>
              <label className="field-label muted" htmlFor="postcodeField">Your postcode</label>
              <input
                id="postcodeField"
                className="form-input muted-bg"
                style={{ maxWidth: '12rem' }}
                type="text"
                placeholder="e.g. 2000"
                value={formData.postcode}
                onChange={e => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
              />
              <span className="field-hint">Only shared with verified recipients once accepted.</span>
            </div>

            <div>
              <label className="field-label muted" htmlFor="orgCode">Food Bank Code</label>
              <input
                id="orgCode"
                className="form-input muted-bg"
                style={{ maxWidth: '12rem' }}
                type="text"
                placeholder="e.g. FB001"
                maxLength="10"
                value={formData.orgCode}
                onChange={e => setFormData(prev => ({ ...prev, orgCode: e.target.value.toUpperCase() }))}
              />
              <span className="field-hint">Ask the food bank staff for their code.</span>
            </div>
          </div>
        </main>

        {/* Fixed bottom action */}
        <footer className="form-footer">
          <div className="form-footer-inner">
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !formData.foodType || !formData.postcode || !formData.orgCode}
            >
              {loading ? 'Posting...' : 'Post listing — takes under 60 seconds'}
              {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
            <p className="form-security-note">Secure Civic Platform • Data Encrypted</p>
          </div>
        </footer>
      </form>
    </div>
  )
}

export default DonationForm
