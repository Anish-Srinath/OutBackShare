import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/HomePage.css'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      {/* Logo */}
      <header className="home-header">
        <h1 className="brand-name">CrisisLink</h1>
      </header>

      {/* Main */}
      <main className="home-main">
        <p className="home-question">How are you using CrisisLink today?</p>

        <div className="cards-grid">
          {/* Donor card */}
          <div className="role-card" onClick={() => navigate('/postcode')}>
            <div className="role-card-accent donor" />
            <div className="role-card-inner">
              <div className="role-icon-circle donor">
                <span className="material-symbols-outlined">bakery_dining</span>
              </div>
              <h3 className="role-card-title donor">I have food to give</h3>
              <p className="role-card-desc">Post surplus food for your community</p>
              <button
                className="role-btn donor"
                onClick={(e) => { e.stopPropagation(); navigate('/postcode') }}
              >
                Post surplus
              </button>
            </div>
          </div>

          {/* Org / community card */}
          <div className="role-card" onClick={() => navigate('/postcode')}>
            <div className="role-card-accent org" />
            <div className="role-card-inner">
              <div className="role-icon-circle org">
                <span className="material-symbols-outlined">corporate_fare</span>
              </div>
              <h3 className="role-card-title org">I run a community group</h3>
              <p className="role-card-desc">See what is available near you</p>
              <button
                className="role-btn org"
                onClick={(e) => { e.stopPropagation(); navigate('/postcode') }}
              >
                View board
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer decorative element */}
      <footer className="home-footer" />
    </div>
  )
}

export default HomePage
