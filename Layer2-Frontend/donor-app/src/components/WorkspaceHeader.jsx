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
    <header
      className={`workspace-header workspace-header--${role} sticky top-0 z-40 bg-background/80 backdrop-blur-md px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between border-b border-surface-container-high`.trim()}
    >
      <div className="flex items-center gap-4">
        {onBackClick ? (
          <button
            className="workspace-header__back-btn p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
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

      <div className="flex items-center gap-base">
        {utilityContent ? (
          <div className="workspace-header__utility">{utilityContent}</div>
        ) : null}

        {showLanguage ? (
          <div className="workspace-header__language relative">
            <button
              className="workspace-header__icon-btn p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
              type="button"
              onClick={() => setShowLanguageMenu((prev) => !prev)}
              aria-label={t('common.language', 'Language')}
            >
              <span className="material-symbols-outlined">language</span>
            </button>
            {showLanguageMenu ? (
              <div className="workspace-header__language-menu absolute right-0 top-full mt-1 bg-surface-container-lowest border border-surface-container-high rounded-2xl shadow-paper overflow-hidden z-50 min-w-[120px]">
                <button
                  type="button"
                  className="block w-full text-left px-md py-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors"
                  onClick={() => handleLanguageChange('en')}
                >
                  English
                </button>
                <button
                  type="button"
                  className="block w-full text-left px-md py-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors"
                  onClick={() => handleLanguageChange('zh')}
                >
                  中文
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Profile avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary-container text-[18px]">person</span>
        </div>
      </div>
    </header>
  )
}

export default WorkspaceHeader
