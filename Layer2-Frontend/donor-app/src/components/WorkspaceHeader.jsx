import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/WorkspaceShell.css'
import logoUrl from '../assets/outbackshare-logo.png'

const WorkspaceHeader = ({ role = 'org', onBrandClick, onBackClick = null, utilityContent = null, showLanguage = true }) => {
  const { t, i18n } = useTranslation()
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang)
    window.localStorage.setItem('preferredLanguage', lang)
    setShowLanguageMenu(false)
  }

  return (
    <header className={`workspace-header workspace-header--${role}`.trim()}>
      <div className="workspace-header__inner">
        <div className="workspace-header__leading">
          {onBackClick ? (
            <button
              className="workspace-header__back-btn"
              type="button"
              onClick={onBackClick}
              aria-label={t('common.back', 'Back')}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          ) : null}

          <button
            className="workspace-header__brand-btn"
            type="button"
            onClick={onBrandClick}
            aria-label={t('appName')}
          >
            <img
              src={logoUrl}
              alt={t('appName')}
              className="workspace-header__brand-logo"
              style={{ height: '38px', width: 'auto', display: 'block' }}
            />
          </button>
        </div>

        <div className="workspace-header__actions">
          {utilityContent ? <div className="workspace-header__utility">{utilityContent}</div> : null}
          {showLanguage ? (
            <div className="workspace-header__language">
              <button
                className="workspace-header__icon-btn"
                type="button"
                onClick={() => setShowLanguageMenu((prev) => !prev)}
                aria-label={t('common.language', 'Language')}
              >
                <span className="material-symbols-outlined">language</span>
              </button>
              {showLanguageMenu ? (
                <div className="workspace-header__language-menu">
                  <button type="button" onClick={() => handleLanguageChange('en')}>English</button>
                  <button type="button" onClick={() => handleLanguageChange('zh')}>中文</button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div className="workspace-header__divider" />
    </header>
  )
}

export default WorkspaceHeader
