import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  generateDonorCode,
  generateOrgCode,
  isSafeCode,
  getStoredDonorCode,
  getStoredOrgCode,
  storeDonorCode,
  storeOrgCode,
  storeDonorName,
  storeOrgName,
} from '../utils/codeGeneration'
import { registerUser, checkCodeAvailability } from '../services/api'
import '../styles/RegisterPage.css'

const sanitiseText = (v) => v.replace(/[<>"'`;]/g, '').slice(0, 500)
const sanitiseCodeInput = (v) => v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20)
const DISTANCE_OPTIONS = [5, 10, 20, 30, 50, 100]

const RegisterPage = () => {
  const { role } = useParams()   // 'donor' | 'org'
  const navigate  = useNavigate()
  const isDonor   = role === 'donor'

  // 'signin' → default entry (code input)
  // 'form'   → registration form (name, address, etc.)
  // 'code'   → generated code display (reached only after completing form)
  const [step, setStep] = useState('signin')

  // Form fields
  const [orgName,           setOrgName]           = useState('')
  const [businessAddress,   setBusinessAddress]   = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [maxDistance,       setMaxDistance]       = useState('')
  const [formError,         setFormError]         = useState('')

  // Code step
  const [codeMode,      setCodeMode]      = useState('generate')
  const [generatedCode, setGeneratedCode] = useState('')   // blank until explicitly generated
  const [existingInput, setExistingInput] = useState('')
  const [copied,        setCopied]        = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError,   setSubmitError]   = useState('')

  useEffect(() => {
    if (role !== 'donor' && role !== 'org') {
      navigate('/', { replace: true })
      return
    }
    // Pre-fill sign-in input with stored code for convenience (returning users)
    const stored = isDonor ? getStoredDonorCode() : getStoredOrgCode()
    if (stored) setExistingInput(stored)
    setStep('signin')
  }, [role, isDonor, navigate])

  // ── Sign-in step ──────────────────────────────────────────────────────────────

  const handleSignIn = () => {
    setSubmitError('')
    const code = existingInput.trim()
    if (!code) {
      setSubmitError('Please enter your access code.')
      return
    }
    if (!isSafeCode(code)) {
      setSubmitError('Codes must be uppercase letters, digits, and hyphens only (3–20 characters).')
      return
    }
    if (isDonor) {
      storeDonorCode(code)
      navigate('/postcode')
    } else {
      storeOrgCode(code)
      navigate('/org/listings', { state: { orgCode: code } })
    }
  }

  // ── Form step ─────────────────────────────────────────────────────────────────

  const handleFormContinue = () => {
    setFormError('')
    if (!orgName.trim()) {
      setFormError(isDonor ? 'Business name is required.' : 'Organisation name is required.')
      return
    }
    if (isDonor && !preferredLocation.trim()) {
      setFormError('Preferred drop-off location is required.')
      return
    }
    if (!isDonor && !maxDistance) {
      setFormError('Please select a maximum pickup distance.')
      return
    }
    setGeneratedCode('')   // blank — user will click Generate
    setCodeMode('generate')
    setSubmitError('')
    setStep('code')
  }

  // ── Code step ─────────────────────────────────────────────────────────────────

  const handleGenerateCode = useCallback(() => {
    setGeneratedCode(isDonor ? generateDonorCode() : generateOrgCode())
    setCopied(false)
    setSubmitError('')
  }, [isDonor])

  const handleCopy = useCallback(async () => {
    if (!generatedCode) return
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API blocked in non-HTTPS dev env — silent fallback
    }
  }, [generatedCode])

  const handleExistingInputChange = (e) => {
    setExistingInput(sanitiseCodeInput(e.target.value))
    setSubmitError('')
  }

  const handleConfirm = async () => {
    if (submitLoading) return
    const code = codeMode === 'existing' ? existingInput : generatedCode
    if (!code) {
      setSubmitError(codeMode === 'generate'
        ? 'Please click "Generate code" first, then confirm.'
        : 'Please enter your access code.')
      return
    }
    if (!isSafeCode(code)) {
      setSubmitError('Codes must be uppercase letters, digits, and hyphens only.')
      return
    }

    // Existing-code path — no API call needed
    if (codeMode === 'existing') {
      if (isDonor) {
        storeDonorCode(code)
        navigate('/postcode')
      } else {
        storeOrgCode(code)
        navigate('/org/listings', { state: { orgCode: code } })
      }
      return
    }

    // New code path — register via API
    setSubmitLoading(true)
    setSubmitError('')
    try {
      // Check uniqueness (best-effort)
      try {
        const { available } = await checkCodeAvailability(code)
        if (!available) {
          setGeneratedCode('')
          setSubmitError('That code is already taken. Please generate a new one.')
          setSubmitLoading(false)
          return
        }
      } catch {
        // Availability check is best-effort; proceed with registration
      }

      const orgType = isDonor ? 'donor' : 'community_org'
      await registerUser({
        orgType,
        orgCode:             code,
        orgName:             orgName.trim(),
        businessAddress:     businessAddress.trim() || null,
        preferredLocation:   isDonor  ? preferredLocation.trim() || null : null,
        maxPickupDistanceKm: !isDonor ? Number(maxDistance) || null      : null,
      })

      if (isDonor) {
        storeDonorCode(code)
        storeDonorName(orgName.trim())
        navigate('/postcode')
      } else {
        storeOrgCode(code)
        storeOrgName(orgName.trim())
        navigate('/org/listings', { state: { orgCode: code, orgName: orgName.trim() } })
      }
    } catch (err) {
      const status = err?.response?.status
      if (status === 429) {
        setSubmitError('Too many attempts. Please wait a moment and try again.')
      } else {
        setSubmitError('Registration failed. Please try again.')
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  if (role !== 'donor' && role !== 'org') return null

  const icon      = isDonor ? 'bakery_dining' : 'corporate_fare'
  const color     = isDonor ? 'donor' : 'org'
  const roleClass = isDonor ? 'donor-role-page' : 'org-role-page'

  return (
    <div className={`register-page ${roleClass}`}>
      <button
        className="back-link"
        onClick={() => {
          if (step === 'form') { setStep('signin'); setFormError('') }
          else if (step === 'code') { setStep('form'); setSubmitError('') }
          else navigate('/')
        }}
        aria-label="Back"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      <main className="register-main">
        <div className="register-card">

          <div className={`register-icon-circle ${color}`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div className="register-brand">OutBackShare</div>

          {/* ── SIGN IN ── */}
          {step === 'signin' && (
            <>
              <h1 className="register-title">
                {isDonor ? 'Donor Workspace' : 'Organisation Workspace'}
              </h1>
              <p className="register-desc">
                Enter your access code to continue.
              </p>

              <input
                className="org-code-input"
                type="text"
                value={existingInput}
                onChange={handleExistingInputChange}
                placeholder={isDonor ? 'e.g. DNR-ABCDEF' : 'e.g. CBO-ABC-1234'}
                maxLength={20}
                autoComplete="off"
                spellCheck={false}
                aria-label="Enter your access code"
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              />

              {submitError && (
                <div className="error-message" role="alert" aria-live="assertive">{submitError}</div>
              )}

              <button type="button" className="submit-btn" onClick={handleSignIn}>
                Sign in →
              </button>

              <div className="register-divider"><span>or</span></div>

              <button
                type="button"
                className="register-new-user-btn"
                onClick={() => { setSubmitError(''); setExistingInput(''); setStep('form') }}
              >
                <span className="material-symbols-outlined">person_add</span>
                New user? Register here
              </button>

              <p className="privacy-note">Your code is stored on this device only.</p>
            </>
          )}

          {/* ── FORM ── */}
          {step === 'form' && (
            <>
              <h1 className="register-title">
                {isDonor ? 'Donor Registration' : 'Organisation Registration'}
              </h1>
              <p className="register-desc">
                {isDonor
                  ? 'Tell us about your business so we can set up your donor workspace.'
                  : 'Tell us about your organisation before we generate your access code.'}
              </p>

              <div className="register-form">

                <div className="field-group">
                  <label className="field-label" htmlFor="orgName">
                    {isDonor ? 'Business Name' : 'Organisation Name'} <span className="required">*</span>
                  </label>
                  <input
                    id="orgName"
                    className="field-input"
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(sanitiseText(e.target.value))}
                    placeholder={isDonor ? 'e.g. Sunshine Bakery' : 'e.g. Harbour Community Food Bank'}
                    maxLength={255}
                    autoComplete="organization"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="businessAddress">
                    Business Address
                  </label>
                  <input
                    id="businessAddress"
                    className="field-input"
                    type="text"
                    value={businessAddress}
                    onChange={e => setBusinessAddress(sanitiseText(e.target.value))}
                    placeholder="e.g. 42 Main Street, Melbourne VIC 3000"
                    maxLength={500}
                    autoComplete="street-address"
                  />
                </div>

                {isDonor && (
                  <div className="field-group">
                    <label className="field-label" htmlFor="preferredLocation">
                      Preferred Drop-off Location <span className="required">*</span>
                    </label>
                    <input
                      id="preferredLocation"
                      className="field-input"
                      type="text"
                      value={preferredLocation}
                      onChange={e => setPreferredLocation(sanitiseText(e.target.value))}
                      placeholder="e.g. Fitzroy Community Centre, 123 Smith St"
                      maxLength={500}
                    />
                    <span className="field-hint">Where recipients can collect food from your business.</span>
                  </div>
                )}

                {!isDonor && (
                  <div className="field-group">
                    <label className="field-label" htmlFor="maxDistance">
                      Maximum Pickup Distance <span className="required">*</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="maxDistance"
                        className="field-select"
                        value={maxDistance}
                        onChange={e => setMaxDistance(e.target.value)}
                      >
                        <option value="" disabled>Select distance…</option>
                        {DISTANCE_OPTIONS.map(d => (
                          <option key={d} value={d}>{d} km</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined select-arrow">expand_more</span>
                    </div>
                    <span className="field-hint">Furthest distance your organisation can travel to collect food.</span>
                  </div>
                )}

                {formError && (
                  <div className="error-message" role="alert" aria-live="assertive">{formError}</div>
                )}

                <button type="button" className="submit-btn" onClick={handleFormContinue}>
                  Continue →
                </button>

                <p className="privacy-note">
                  Your information is stored securely and used only to match food donations within the OutBackShare network.
                </p>
              </div>
            </>
          )}

          {/* ── CODE ── */}
          {step === 'code' && (
            <>
              <h1 className="register-title">
                {isDonor ? 'Your Donor Code' : 'Your Organisation Code'}
              </h1>
              <p className="register-desc">
                {isDonor
                  ? 'Generate and save your unique donor code.'
                  : 'Generate and keep your access code safe — share it only with your team.'}
              </p>

              <div className="register-mode-tabs" role="tablist">
                <button
                  role="tab"
                  aria-selected={codeMode === 'generate'}
                  className={`mode-tab ${codeMode === 'generate' ? 'active' : ''}`}
                  onClick={() => { setCodeMode('generate'); setSubmitError('') }}
                  type="button"
                >
                  New code
                </button>
                <button
                  role="tab"
                  aria-selected={codeMode === 'existing'}
                  className={`mode-tab ${codeMode === 'existing' ? 'active' : ''}`}
                  onClick={() => { setCodeMode('existing'); setSubmitError('') }}
                  type="button"
                >
                  I have a code
                </button>
              </div>

              {codeMode === 'generate' && (
                <>
                  <div
                    className={`code-display-box ${color}${!generatedCode ? ' code-display-box--empty' : ''}`}
                    aria-live="polite"
                  >
                    {generatedCode
                      ? <span className="code-display-text">{generatedCode}</span>
                      : <span className="code-display-placeholder">Click "Generate code" below</span>
                    }
                  </div>

                  <div className="code-actions">
                    {generatedCode && (
                      <button type="button" className="btn-copy" onClick={handleCopy} aria-label="Copy code">
                        <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`btn-regenerate${!generatedCode ? ' btn-regenerate--generate' : ''}`}
                      onClick={handleGenerateCode}
                      aria-label={generatedCode ? 'Generate a different code' : 'Generate code'}
                    >
                      <span className="material-symbols-outlined">refresh</span>
                      {generatedCode ? 'New code' : 'Generate code'}
                    </button>
                  </div>
                </>
              )}

              {codeMode === 'existing' && (
                <input
                  className="org-code-input"
                  type="text"
                  value={existingInput}
                  onChange={handleExistingInputChange}
                  placeholder={isDonor ? 'e.g. DNR-ABCDEF' : 'e.g. CBO-ABC-1234'}
                  maxLength={20}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Enter your existing code"
                />
              )}

              {submitError && (
                <div className="error-message" role="alert" aria-live="assertive">{submitError}</div>
              )}

              <button
                type="button"
                className="submit-btn"
                onClick={handleConfirm}
                disabled={
                  submitLoading ||
                  (codeMode === 'generate' && !generatedCode) ||
                  (codeMode === 'existing' && !existingInput)
                }
              >
                {submitLoading ? 'Setting up…' : 'Start using OutBackShare →'}
              </button>

              <p className="privacy-note">
                Your code is stored on this device only and is used solely to identify your contributions within the app.
              </p>
            </>
          )}

        </div>
      </main>
    </div>
  )
}

export default RegisterPage
