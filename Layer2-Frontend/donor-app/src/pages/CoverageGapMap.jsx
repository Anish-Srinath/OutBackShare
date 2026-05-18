import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ChoroplethMap from '../components/ChoroplethMap'
import { predictionApiClient } from '../services/api'
import suburbLookup from '../data/vic_postcode_suburbs.json'
import logoUrl from '../assets/outbackshare-logo.png'
import textureImg from '../assets/post-food-texture.jpg'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useIsMobile } from '../utils/useIsMobile'

// Matches backend _risk_label() thresholds
const RISK_COLORS = {
  critical:      '#e53030',
  high:          '#e53030',
  'medium-high': '#e8711a',
  'medium-low':  '#d69e2e',
  low:           '#1a9c67',
  none:          '#94a3b8',
}

function riskColorFromLabel(label) {
  return RISK_COLORS[label] || RISK_COLORS.none
}

function toneFromLabel(label) {
  if (!label) return 'watch'
  if (label === 'high')        return 'critical'
  if (label === 'medium-high') return 'high'
  if (label === 'medium-low')  return 'watch'
  return 'healthy'
}

const LEGEND = [
  { label: 'High (≥0.75)',         color: RISK_COLORS.high          },
  { label: 'Medium-high (≥0.50)',  color: RISK_COLORS['medium-high'] },
  { label: 'Medium-low (≥0.25)',   color: RISK_COLORS['medium-low']  },
  { label: 'Low (<0.25)',          color: RISK_COLORS.low            },
  { label: 'No score yet',         color: RISK_COLORS.none           },
]

const ORG_NAV = [
  { label: 'Listings',          path: '/org/listings'     },
  { label: 'Area Intelligence', path: '/org/intelligence' },
  { label: 'Around Me',         path: '/org/coverage-map', active: true },
]

export default function CoverageGapMap() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const SIDE_PAD = isMobile ? 16 : 48

  // Capture donor context on first render — persists across tab/filter changes within page
  const fromDonor      = useRef(location.state?.fromDonor || false)
  const donorReturn    = useRef(location.state?.returnPath || '/donor/listings')

  const [riskData, setRiskData]         = useState([])   // raw API rows
  const [selected, setSelected]         = useState(null) // postcode string
  const [loading, setLoading]           = useState(true)
  const [showInfo, setShowInfo]         = useState(false)

  const savedOrgSession = (() => {
    if (fromDonor.current) return {}
    try { return JSON.parse(window.localStorage.getItem('crisislink-org-session') || '{}') }
    catch { return {} }
  })()
  const orgCode = fromDonor.current ? null : (location.state?.orgCode || savedOrgSession.orgCode || 'HCFB-2841')

  // /predictions/all-risk-scores returns ALL postcodes across all risk bands
  // (unlike /intelligence/supply-gaps which filters HAVING risk > 0.5)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    predictionApiClient.get('/predictions/all-risk-scores')
      .then(res => { if (!cancelled) setRiskData(res.data || []) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Build lookup: postcode → row
  const riskMap = useMemo(() => {
    const m = {}
    for (const row of riskData) m[String(row.postcode)] = row
    return m
  }, [riskData])

  // Map zones — all rows, colour by risk_label from backend
  const mapZones = useMemo(() =>
    riskData.map(item => ({
      postcode: String(item.postcode),
      suburb:   suburbLookup[String(item.postcode)] || String(item.postcode),
      tone:     toneFromLabel(item.risk_label),
      metric:   `${item.risk_label ? item.risk_label.charAt(0).toUpperCase() + item.risk_label.slice(1) : 'No score'} risk — ${(item.demand_risk_score * 100).toFixed(0)}%`,
    }))
  , [riskData])

  // Derived counts
  const atRiskCount = useMemo(() => riskData.filter(d => d.demand_risk_score >= 0.5).length, [riskData])
  const totalCount  = riskData.length
  const selectedRow = selected ? riskMap[selected] : null

  function goBack() {
    if (fromDonor.current) navigate(donorReturn.current)
    else navigate('/org/listings', { state: { orgCode } })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1b4332', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* Bloom layers */}
      <div style={{ position: 'fixed', top: '10%', left: '15%', width: 520, height: 520, borderRadius: '50%', background: 'rgba(45,106,79,0.28)', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '10%', width: 420, height: 420, borderRadius: '50%', background: 'rgba(45,106,79,0.22)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', width: 360, height: 360, borderRadius: '50%', background: 'rgba(26,156,103,0.12)', filter: 'blur(100px)', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Texture overlay */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${textureImg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.05, pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(27,67,50,0.84)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(149,212,179,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${SIDE_PAD}px`, height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button type="button" onClick={goBack}
              style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.75)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
            </button>
            <button type="button" onClick={goBack} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
              <img src={logoUrl} alt="OutBackShare" style={{ height: 30, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
            </button>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {ORG_NAV.map(tab => (
              <button key={tab.label} type="button"
                onClick={() => navigate(tab.path, { state: { orgCode, fromDonor: fromDonor.current, returnPath: donorReturn.current } })}
                style={{
                  padding: '7px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: tab.active ? 'rgba(149,212,179,0.22)' : 'transparent',
                  color: tab.active ? '#95d4b3' : 'rgba(255,255,255,0.6)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!tab.active) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' } }}
                onMouseLeave={e => { if (!tab.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' } }}
              >{tab.label}</button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageSwitcher dark />
            {fromDonor.current ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(149,212,179,0.12)', border: '1px solid rgba(149,212,179,0.3)', borderRadius: 999, padding: '5px 14px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#95d4b3' }}>volunteer_activism</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#95d4b3' }}>Donor view</span>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                {orgCode}
              </div>
            )}
          </div>
        </header>

        {/* ── Page heading ── */}
        <div style={{ padding: `${isMobile ? 24 : 40}px ${SIDE_PAD}px 20px` }}>
          <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>Around Me</h1>
          <p style={{ fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
            Live demand risk signals for all scored postcodes · {totalCount} areas loaded
          </p>
        </div>

        {/* ── Info banner ── */}
        <div style={{ margin: `0 ${SIDE_PAD}px 20px`, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(149,212,179,0.2)', borderRadius: 12, padding: '12px 18px' }}>
          <button
            onClick={() => setShowInfo(!showInfo)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#95d4b3', fontWeight: 600, fontSize: '0.88rem', width: '100%', textAlign: 'left', padding: 0 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>info</span>
            <span>Around me – what this shows</span>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginLeft: 'auto', color: 'rgba(255,255,255,0.4)' }}>{showInfo ? 'expand_less' : 'expand_more'}</span>
          </button>
          {showInfo && (
            <p style={{ marginTop: 10, fontSize: '0.83rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              Shows demand risk across all scored postcodes — from high risk (red) to low risk (green). Use it to identify where food supply is needed and where you can avoid duplicating existing supply.
            </p>
          )}
        </div>

        {/* ── Map + Side panel ── */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', margin: `0 ${SIDE_PAD}px 48px`, gap: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(149,212,179,0.15)', height: isMobile ? 'auto' : '62vh', minHeight: isMobile ? 'auto' : 480 }}>

          {/* Map */}
          <div style={{ flex: 1, position: 'relative', height: isMobile ? '55vh' : 'auto', minHeight: isMobile ? 360 : 'auto' }}>
            <style>{`
              @keyframes cgm-pulse-ring {
                0%   { transform: scale(0.6); opacity: 0.9; }
                100% { transform: scale(2.6); opacity: 0;   }
              }
              @keyframes cgm-shimmer {
                0%   { background-position: -200% 0; }
                100% { background-position:  200% 0; }
              }
              @keyframes cgm-dot-bounce {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                40%           { transform: scale(1);   opacity: 1;   }
              }
            `}</style>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, gap: 28, background: 'linear-gradient(135deg, rgba(15,55,40,0.95) 0%, rgba(27,67,50,0.95) 100%)', opacity: loading ? 1 : 0, pointerEvents: loading ? 'auto' : 'none', transition: 'opacity 1s ease', overflow: 'hidden' }}>
              {/* Shimmer scan band */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(149,212,179,0.08) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'cgm-shimmer 2.4s ease-in-out infinite' }} />

              {/* Pulsing radar */}
              <div style={{ position: 'relative', width: 80, height: 80, zIndex: 2 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(149,212,179,0.6)', animation: `cgm-pulse-ring 2.2s ease-out ${i * 0.7}s infinite` }} />
                ))}
                <div style={{ position: 'absolute', inset: '30%', borderRadius: '50%', background: 'rgba(149,212,179,0.9)', boxShadow: '0 0 24px rgba(149,212,179,0.7)' }} />
              </div>

              {/* Text + bouncing dots */}
              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <p style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 6px 0' }}>Mapping risk zones across Victoria</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                  <span>Loading</span>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#95d4b3', display: 'inline-block', animation: `cgm-dot-bounce 1.4s ease-in-out ${i * 0.16}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
            <ChoroplethMap
              zones={mapZones}
              selectedPostcode={selected || ''}
              onSelect={setSelected}
              height="100%"
              defaultCenter={[-36.8, 144.9]}
              defaultZoom={7}
            />
          </div>

          {/* Side panel */}
          <div style={{ width: isMobile ? '100%' : 280, background: 'rgba(27,67,50,0.92)', borderLeft: isMobile ? 'none' : '1px solid rgba(149,212,179,0.15)', borderTop: isMobile ? '1px solid rgba(149,212,179,0.15)' : 'none', overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Legend — colours match ChoroplethMap TONE_FILL exactly */}
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                Risk level
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {LEGEND.map(({ label, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: color, flexShrink: 0, opacity: 0.9 }} />
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Coverage summary
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: '#fc9174', lineHeight: 1 }}>{atRiskCount}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>at-risk zones (≥0.50)</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#95d4b3', lineHeight: 1 }}>{totalCount}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>total zones</p>
                </div>
              </div>
            </div>

            {/* Selected postcode detail */}
            {selectedRow ? (
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(149,212,179,0.2)', borderRadius: 10, padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', margin: 0 }}>
                      {suburbLookup[String(selectedRow.postcode)] || `Postcode ${selectedRow.postcode}`}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>{selectedRow.postcode}</p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', lineHeight: 1, padding: 4, flexShrink: 0 }}
                  >✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <Row label="Demand risk">
                    <span style={{ color: riskColorFromLabel(selectedRow.risk_label || toneFromLabel(selectedRow.risk_label)), fontWeight: 700, fontSize: '0.82rem' }}>
                      {(selectedRow.demand_risk_score * 100).toFixed(0)}%
                      {' — '}
                      {selectedRow.risk_label
                        ? selectedRow.risk_label.charAt(0).toUpperCase() + selectedRow.risk_label.slice(1)
                        : 'No score'}
                    </span>
                  </Row>
                  {selectedRow.irsd_score != null && (
                    <Row label="SEIFA IRSD">
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>{selectedRow.irsd_score}</span>
                    </Row>
                  )}
                  <Row label="Active listings">
                    <span style={{ fontWeight: 700, color: selectedRow.active_listings === 0 ? '#fc9174' : '#95d4b3', fontSize: '0.82rem' }}>
                      {selectedRow.active_listings}
                    </span>
                  </Row>
                  <Row label="Total supply">
                    <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>
                      {selectedRow.total_supply} portions
                    </span>
                  </Row>
                  {selectedRow.regional_category && (
                    <Row label="Region">
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{selectedRow.regional_category}</span>
                    </Row>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center', marginTop: 8 }}>
                Click any postcode on the map to see its details
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', gap: 8 }}>
      <span style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  )
}
