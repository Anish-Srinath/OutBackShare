import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../styles/PostFeedPage.css'

const PostFeedPage = () => {
  const { postcode } = useParams()
  const navigate = useNavigate()
  const [listings] = useState([
    {
      id: 1,
      title: 'Artisan Sourdough Loaves',
      source: 'Bourke St Bakehouse',
      emoji: '🍞',
      quantity: '18 loaves',
      category: 'Bakery',
      ai: 94,
      time: '8 min ago',
      distance: '0.4 km',
      status: 'available',
      tags: ['Vegan', 'Fresh baked']
    },
    {
      id: 2,
      title: 'Mixed Seasonal Vegetables',
      source: 'Richmond Farmers Market',
      emoji: '🥕',
      quantity: '~30 kg',
      category: 'Market',
      ai: 91,
      time: 'Just now',
      distance: '0.8 km',
      status: 'claimed',
      claimedBy: 'Fitzroy Food Bank',
      tags: ['Organic', 'Fresh']
    }
  ])

  return (
    <div className="post-feed-page">
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="nav-left">
          <span>🥬</span>
          <span>CrisisLink</span>
        </div>
        <div className="nav-right">
          <div className="nav-item">
            🌐 English
          </div>
          <div className="nav-item notification-icon">
            🔔
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="feed-content">
        {/* Location Info */}
        <div className="location-info">
          <div className="location-left">
            <span>📍</span>
            <span>Postcode <strong>{postcode}</strong> · 5 km radius</span>
          </div>
          <div className="stats">
            <span><strong>4</strong> available</span>
            <span><strong>2</strong> claimed</span>
          </div>
        </div>

        {/* Main Post Section */}
        <div className="post-section">
          <div className="post-header">
            <div className="user-avatar">D</div>
            <div className="post-search">
              <input 
                type="text" 
                placeholder="What food are you posting today?"
                onClick={(e) => e.target.focus()}
              />
            </div>
          </div>

          <div className="post-tabs">
            <button className="tab-btn">📷 Photo</button>
            <button className="tab-btn active">📍 Location</button>
            <button className="tab-btn">🖼️ Gallery</button>
          </div>

          <button 
            onClick={() => navigate('/form')}
            className="post-btn"
          >
            Post surplus
          </button>
        </div>

        {/* Alert Box */}
        <div className="alert-box">
          <div className="alert-icon">⏰</div>
          <div className="alert-content">
            <div className="alert-title">4 high-need zones near you</div>
            <div className="alert-text">
              Sunshine · Footscray · Noble Park · Werribee
            </div>
            <a href="#" className="alert-link" onClick={(e) => {
              e.preventDefault()
              alert('Opening map...')
            }}>
              View map →
            </a>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="recent-listings-section">
          <div className="section-title">Recent Listings</div>

          {listings.map(listing => (
            <div key={listing.id} className="listing-item">
              <div className="listing-image">{listing.emoji}</div>
              <div className="listing-content">
                <div className="listing-header">
                  <div>
                    <div className="listing-title">{listing.title}</div>
                    <div className="listing-source">{listing.source}</div>
                  </div>
                  <span className={`listing-badge badge-ai`}>+ AI {listing.ai}%</span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {listing.quantity} · {listing.category}
                  </span>
                </div>
                <div className="listing-tags">
                  {listing.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="listing-time">
                  📍 {listing.distance} · ⏱️ {listing.time} · 
                  {listing.status === 'available' ? (
                    <span className="status-available">Available</span>
                  ) : (
                    <span className="status-claimed">Claimed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-btn active">
          <span>🏠</span>
          <span className="nav-label">Feed</span>
        </button>
        <button 
          onClick={() => navigate('/form')}
          className="post-icon-btn"
        >
          +
        </button>
        <button className="nav-btn">
          <span>📍</span>
          <span className="nav-label">Map</span>
        </button>
      </nav>
    </div>
  )
}

export default PostFeedPage
