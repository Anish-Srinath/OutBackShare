import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/OrgCodeInputPage.css'

const OrgCodeInputPage = () => {
  const navigate = useNavigate()
  const [orgCode, setOrgCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.getElementById('org-code-input')?.focus()
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20)
    setOrgCode(value)
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (orgCode.trim()) {
      navigate('/org/dashboard', { state: { orgCode } })
    } else {
      setError('Please enter your organisation code to continue')
    }
  }

  return (
    <div className="org-code-page">
      <button className="back-link" onClick={() => navigate('/')}>
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      <main className="org-code-main">
        <div className="org-code-card">
          <div className="org-code-icon-circle">
            <span className="material-symbols-outlined">business</span>
          </div>

          <div className="org-code-brand">CrisisLink</div>

          <h1 className="org-code-title">Organisation code</h1>
          <p className="org-code-desc">
            Enter your unique code issued with your FoodSafe registration. You'll access your live inventory dashboard immediately.
          </p>

          <form onSubmit={handleSubmit} className="form-group">
            <input
              id="org-code-input"
              className="org-code-input"
              type="text"
              value={orgCode}
              onChange={handleInputChange}
              placeholder="HCFB-2841"
              maxLength="20"
              autoComplete="off"
            />

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn">
              Access Dashboard →
            </button>

            <button
              type="button"
              className="secondary-link"
              onClick={() => navigate('/')}
            >
              Back to home
            </button>

            <p className="privacy-note">
              Your code grants secure access to your organization's dashboard.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}

export default OrgCodeInputPage
