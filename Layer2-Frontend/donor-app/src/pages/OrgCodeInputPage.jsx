import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../styles/OrgCodeInputPage.css'
import logoUrl from '../assets/outbackshare-logo.png'

const ORG_SESSION_KEY = 'crisislink-org-session'

const OrgCodeInputPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [orgCode, setOrgCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.getElementById('org-code-input')?.focus()
  }, [])

  const handleOrgCodeChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z0-9 -]/g, '').slice(0, 40)
    setOrgCode(value)
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = orgCode.trim()
    if (!trimmed) {
      setError(t('orgCode.example'))
      return
    }

    const orgSession = { orgCode: trimmed.toUpperCase() }
    window.localStorage.setItem(ORG_SESSION_KEY, JSON.stringify(orgSession))
    navigate('/org/listings', { state: orgSession })
  }

  return (
    <div className="org-code-page org-role-page">
      <button className="org-code-back-link" onClick={() => navigate('/roles')}>
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      <main className="org-code-main">
          <div className="org-code-card">
            <div className="org-code-icon-circle">
            <span className="material-symbols-outlined">groups</span>
          </div>

          <img
            src={logoUrl}
            alt={t('appName')}
            className="org-code-brand"
            style={{ height: '52px', width: 'auto', display: 'block', margin: '0 auto 0.5rem' }}
          />

          <h1 className="org-code-title">{t('orgCode.title')}</h1>
          <p className="org-code-desc">{t('orgCode.subtitle')}</p>

          <form onSubmit={handleSubmit} className="org-code-form">
            <input
              id="org-code-input"
              className="org-code-input"
              type="text"
              value={orgCode}
              onChange={handleOrgCodeChange}
              placeholder={t('orgCode.placeholder')}
              maxLength="40"
              autoComplete="organization"
              aria-label={t('orgCode.label')}
            />

            {error ? <div className="org-code-error-message">{error}</div> : null}

            <button type="submit" className="org-code-submit-btn">
              {t('orgCode.button')}
            </button>

            <p className="org-code-note">{t('common.secure')}</p>
          </form>

          <p className="org-code-register-hint">
            {t('orgCode.noCode', "Don't have a code?")}{' '}
            <button
              type="button"
              className="org-code-register-link"
              onClick={() => navigate('/register/org')}
            >
              {t('orgCode.registerLink', 'Register your organisation')}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}

export default OrgCodeInputPage
