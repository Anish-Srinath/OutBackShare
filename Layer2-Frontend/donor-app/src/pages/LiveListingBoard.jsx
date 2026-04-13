import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAvailableListings, claimListing } from '../services/api'
import '../styles/LiveListingBoard.css'

const categoryOptions = ['All', 'Bakery', 'Produce', 'Prepared', 'Grocery']

const inferCategory = (foodType = '') => {
  const value = foodType.toLowerCase()
  if (value.includes('bread') || value.includes('pastry') || value.includes('bakery')) return 'Bakery'
  if (value.includes('vegetable') || value.includes('fruit') || value.includes('produce')) return 'Produce'
  if (value.includes('pizza') || value.includes('pasta') || value.includes('meal') || value.includes('prepared')) return 'Prepared'
  return 'Grocery'
}

const getCategoryEmoji = (category) => {
  const map = {
    'Bakery': '🥐',
    'Produce': '🥕',
    'Prepared': '🍜',
    'Grocery': '🛒'
  }
  return map[category] || '📦'
}

const getRelativeTime = (createdAt) => {
  if (!createdAt) return 'Just now'
  const created = new Date(createdAt)
  const diff = Date.now() - created.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const LiveListingBoard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [listings, setListings] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')

  const orgCode = location.state?.orgCode || 'HCFB-2841'
  const postcode = location.state?.postcode || '3000'

  useEffect(() => {
    loadListings()
  }, [])

  useEffect(() => {
    filterAndDisplayListings()
  }, [listings, searchTerm, filterCategory])

  const loadListings = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAvailableListings({ postcode, status: 'available' })
      const formatted = data.map(listing => ({
        ...listing,
        category: inferCategory(listing.foodType),
        emoji: getCategoryEmoji(inferCategory(listing.foodType))
      }))
      setListings(formatted)
    } catch (err) {
      setError('Failed to load listings. Please try again.')
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  const filterAndDisplayListings = () => {
    let filtered = listings
    
    if (filterCategory !== 'All') {
      filtered = filtered.filter(l => l.category === filterCategory)
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(l => 
        l.foodType.toLowerCase().includes(term) ||
        l.description.toLowerCase().includes(term) ||
        l.orgCode.toLowerCase().includes(term)
      )
    }
    
    setFilteredListings(filtered)
  }

  const handleClaim = async (listingId) => {
    setClaimingId(listingId)
    setError('')
    setSuccess('')
    
    try {
      await claimListing(listingId, { orgId: orgCode })
      setSuccess('Listing claimed successfully!')
      setTimeout(() => {
        setSuccess('')
        loadListings()
      }, 1500)
    } catch (err) {
      setError('Failed to claim this listing. It may have been claimed already.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <div className="live-listing-board">
      <header className="board-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        <div className="header-info">
          <h1 className="board-title">
            <span className="material-symbols-outlined">inventory_2</span>
            Live Inventory
          </h1>
          <p className="org-code-display">Code: {orgCode} | Postcode: {postcode}</p>
        </div>
      </header>

      <div className="board-container">
        {/* Search & Filter Bar */}
        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Search food type, donor..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="filter-tabs">
            {categoryOptions.map(cat => (
              <button
                key={cat}
                className={`filter-tab ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Listings Count */}
        <div className="listings-info">
          <p className="listings-count">
            {filteredListings.length} item{filteredListings.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Listings Grid */}
        <div className="listings-grid">
          {loading ? (
            <div className="loading-state">
              <p>Loading listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined">inbox</span>
              <p>No listings match your search</p>
            </div>
          ) : (
            filteredListings.map(listing => (
              <div key={listing.id} className="listing-card">
                <div className="listing-header">
                  <span className="listing-emoji">{listing.emoji}</span>
                  <div className="listing-meta">
                    <h3 className="listing-food">{listing.foodType}</h3>
                    <p className="listing-donor">From: {listing.orgCode || 'Community'}</p>
                  </div>
                  <span className="listing-time">{getRelativeTime(listing.createdAt)}</span>
                </div>

                <div className="listing-details">
                  <div className="detail-item">
                    <span className="material-symbols-outlined">straighten</span>
                    <span>{listing.quantity} {listing.unit}</span>
                  </div>
                  <div className="detail-item">
                    <span className="material-symbols-outlined">location_on</span>
                    <span>Postcode {listing.postcode}</span>
                  </div>
                </div>

                {listing.description && (
                  <p className="listing-description">{listing.description}</p>
                )}

                {listing.dietary_tags && listing.dietary_tags.length > 0 && (
                  <div className="listing-tags">
                    {listing.dietary_tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                )}

                <button
                  className="claim-btn"
                  onClick={() => handleClaim(listing.id)}
                  disabled={claimingId === listing.id}
                >
                  {claimingId === listing.id ? 'Claiming...' : 'Claim This →'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default LiveListingBoard
