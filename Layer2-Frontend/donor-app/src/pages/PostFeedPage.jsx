import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/PostFeedPage.css'

const ICON_MAP = {
  bread: 'bakery_dining', bakery: 'bakery_dining', sourdough: 'bakery_dining',
  curry: 'restaurant', meal: 'restaurant', food: 'restaurant',
  egg: 'egg', eggs: 'egg',
  veg: 'nutrition', vegetable: 'nutrition', produce: 'nutrition', salad: 'salad',
  fruit: 'nutrition', rice: 'restaurant', soup: 'soup_kitchen',
  yogurt: 'icecream', dairy: 'icecream', milk: 'icecream',
  sandwich: 'lunch_dining', burger: 'lunch_dining',
  pizza: 'local_pizza',
}

const getIcon = (name = '') => {
  const lower = name.toLowerCase()
  for (const [key, val] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return val
  }
  return 'restaurant'
}

const FILTER_CATEGORIES = ['All', 'Baked goods', 'Produce', 'Dairy', 'Prepared meals', 'Expiring soon']

const PostFeedPage = () => {
  const { postcode } = useParams()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get('/api/listings', {
          params: { postcode, status: 'available' }
        })
        setListings(res.data)
      } catch {
        // Fallback sample data
        setListings([
          {
            id: '1', foodType: 'Artisan Sourdough Loaves', orgCode: 'The Golden Crust Bakery',
            quantity: 40, unit: 'portions', postcode, status: 'available',
            expiresIn: '3 hrs', location: 'Surry Hills (0.8km)',
            createdAt: new Date().toISOString(), dietary_tags: []
          },
          {
            id: '2', foodType: 'Vegetable Curry & Rice', orgCode: 'Spice Route Bistro',
            quantity: 15, unit: 'meals', postcode, status: 'available',
            expiresIn: '2 hrs', location: 'Chippendale (1.2km)',
            createdAt: new Date().toISOString(), dietary_tags: ['vegetarian']
          },
          {
            id: '3', foodType: 'Farm Fresh Eggs', orgCode: 'Locals Market',
            quantity: 10, unit: 'portions', postcode, status: 'claimed',
            claimedBy: "St. Jude's", location: 'Redfern (2.1km)',
            createdAt: new Date().toISOString(), dietary_tags: ['vegetarian']
          },
          {
            id: '4', foodType: 'Seasonal Produce Box', orgCode: 'Urban Harvest Co.',
            quantity: 20, unit: 'kg', postcode, status: 'available',
            expiresIn: '6 hrs', location: 'Pyrmont (2.5km)',
            createdAt: new Date().toISOString(), dietary_tags: ['vegan']
          },
          {
            id: '5', foodType: 'Assorted Organic Yogurts', orgCode: 'Green Grocer Metro',
            quantity: 12, unit: 'units', postcode, status: 'available',
            expiresIn: '4 hrs', location: 'Darlington (1.5km)',
            createdAt: new Date().toISOString(), dietary_tags: []
          },
          {
            id: '6', foodType: 'Premium Deli Sandwiches', orgCode: 'The Lunch Spot',
            quantity: 8, unit: 'boxes', postcode, status: 'claimed',
            claimedBy: 'Hope House', location: 'Newtown (3.0km)',
            createdAt: new Date().toISOString(), dietary_tags: []
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [postcode])

  const handleClaim = async (listingId) => {
    try {
      await axios.post(`/api/listings/${listingId}/claim`, {
        orgId: 'FB-GUEST', orgName: 'Guest Food Bank'
      })
      setListings(prev =>
        prev.map(l => l.id === listingId ? { ...l, status: 'claimed', claimedBy: 'You' } : l)
      )
    } catch {
      alert('Unable to claim this listing. Please try again.')
    }
  }

  const filtered = listings.filter(l => {
    const nameMatch = (l.foodType || '').toLowerCase().includes(search.toLowerCase())
    if (!nameMatch) return false
    if (activeFilter === 'All') return true
    return true // Category filter would need backend category field
  })

  return (
    <div className="post-feed-page">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="nav-brand">CrisisLink</div>
          <div className="nav-center">Location: {postcode}</div>
          <div className="nav-actions">
            <button className="nav-icon-btn" title="Language">
              <span className="material-symbols-outlined">language</span>
            </button>
          </div>
        </div>
        <div className="navbar-divider" />
      </header>

      <main className="feed-content">
        {/* Board heading */}
        <div className="board-header">
          <h1 className="board-title">Live Food Board</h1>
          <p className="board-subtitle">
            Connecting surplus nourishment with regional community hubs in real-time.
          </p>
        </div>

        {/* Filters */}
        <section className="filter-section">
          <div className="search-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search available food..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-chips">
            {FILTER_CATEGORIES.map(f => (
              <button
                key={f}
                className={`filter-chip${activeFilter === f ? ' active' : ''}${f === 'Expiring soon' ? ' expiring' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Cards grid */}
        <div className="food-grid">
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <p>Loading listings...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <h3>No listings found</h3>
              <p>Be the first to post surplus food in {postcode}.</p>
            </div>
          ) : (
            filtered.map(l => {
              const isClaimed = l.status === 'claimed'
              return (
                <div
                  key={l.id}
                  className={[
                    'food-card',
                    isClaimed ? 'food-card--claimed' : '',
                    l.photoUrl ? 'food-card--has-photo' : '',
                  ].join(' ')}
                >
                  {l.photoUrl ? (
                    /* ── Hero photo layout ─────────────────────────── */
                    <div className="food-card-hero">
                      <img
                        src={l.photoUrl}
                        alt={l.foodType}
                        className="food-card-hero-img"
                      />
                      {/* Frosted glass blur fade transitioning into card body */}
                      <div className="food-card-hero-fade" />
                      {/* Qty badge pinned to top-right of image */}
                      <span className={`food-qty-badge food-qty-badge--on-hero${isClaimed ? ' claimed' : ''}`}>
                        ~{l.quantity} {l.unit}
                      </span>
                      {/* Category icon bottom-left of image */}
                      <div className="food-card-hero-icon">
                        <span className="material-symbols-outlined">{getIcon(l.foodType)}</span>
                      </div>
                    </div>
                  ) : (
                    /* ── No photo: classic top row ─────────────────── */
                    <div className="food-card-top">
                      <div className={`food-icon-circle${isClaimed ? ' claimed' : ''}`}>
                        <span className="material-symbols-outlined">{getIcon(l.foodType)}</span>
                      </div>
                      <span className={`food-qty-badge${isClaimed ? ' claimed' : ''}`}>
                        ~{l.quantity} {l.unit}
                      </span>
                    </div>
                  )}

                  {/* ── Card body ───────────────────────────────────── */}
                  <div className="food-card-body">
                    <h3 className={`food-card-name${isClaimed ? ' claimed' : ''}`}>
                      {l.foodType}
                    </h3>
                    <p className={`food-card-source${isClaimed ? ' claimed' : ''}`}>
                      {l.orgCode}
                    </p>

                    <div className="food-card-meta">
                      {isClaimed ? (
                        <div className="food-meta-row claimed-by">
                          <span className="material-symbols-outlined">check_circle</span>
                          Claimed{l.claimedBy ? ` by ${l.claimedBy}` : ''}
                        </div>
                      ) : (
                        <div className="food-meta-row expiry">
                          <span className="material-symbols-outlined">schedule</span>
                          Expires in {l.expiresIn || '–'}
                        </div>
                      )}
                      <div className="food-meta-row location">
                        <span className="material-symbols-outlined">location_on</span>
                        {l.location || l.postcode}
                      </div>
                    </div>
                  </div>

                  {/* ── Claim button ─────────────────────────────────── */}
                  <div className="food-card-actions">
                    {isClaimed ? (
                      <button className="claim-btn claim-btn--disabled" disabled>
                        Claimed
                      </button>
                    ) : (
                      <button
                        className="claim-btn"
                        onClick={() => handleClaim(l.id)}
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* FAB — Post surplus */}
      <button className="fab" onClick={() => navigate(`/form/${postcode}`)} aria-label="Post food">
        <span className="material-symbols-outlined">add</span>
      </button>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button className="nav-tab active">
          <span className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
          <span className="nav-tab-label">Feed</span>
        </button>
        <button className="nav-tab" onClick={() => navigate(`/form/${postcode}`)}>
          <span className="material-symbols-outlined">add_circle</span>
          <span className="nav-tab-label">Post</span>
        </button>
        <button className="nav-tab">
          <span className="material-symbols-outlined">notifications</span>
          <span className="nav-tab-label">Alerts</span>
        </button>
        <button className="nav-tab">
          <span className="material-symbols-outlined">person</span>
          <span className="nav-tab-label">Profile</span>
        </button>
      </nav>
    </div>
  )
}

export default PostFeedPage
