import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/PostcodeInputPage.css'

const PostcodeInputPage = () => {
  const navigate = useNavigate()
  const [postcode, setPostcode] = useState('')

  useEffect(() => {
    document.getElementById('postcode-input')?.focus()
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
    setPostcode(value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (postcode.length === 4) {
      navigate(`/feed/${postcode}`)
    } else {
      alert('Please enter a valid 4-digit postcode')
    }
  }

  return (
    <div className="postcode-page">
      <button className="back-link" onClick={() => navigate('/')}>
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      <main className="postcode-main">
        <div className="postcode-card">
          <div className="postcode-icon-circle">
            <span className="material-symbols-outlined">location_on</span>
          </div>

          <div className="postcode-brand">CrisisLink</div>

          <h1 className="postcode-title">Where are you located?</h1>
          <p className="postcode-desc">
            We'll show food available near your area — matched in real-time.
          </p>

          <form onSubmit={handleSubmit} className="form-group">
            <input
              id="postcode-input"
              className="postcode-input"
              type="text"
              value={postcode}
              onChange={handleInputChange}
              placeholder="3000"
              maxLength="4"
              inputMode="numeric"
              autoComplete="postal-code"
            />

            <button type="submit" className="submit-btn">
              Find Food Near Me →
            </button>

            <button
              type="button"
              className="secondary-link"
              onClick={() => navigate('/form')}
            >
              I want to donate food instead
            </button>

            <p className="privacy-note">
              Your location is only shared with verified food banks.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}

export default PostcodeInputPage
