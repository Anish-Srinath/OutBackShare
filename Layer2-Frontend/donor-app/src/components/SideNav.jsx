import React from 'react'
import { useTranslation } from 'react-i18next'
import logoUrl from '../assets/outbackshare-logo.png'

const SideNav = ({ navItems = [], onPostFood, onLanguage, role = 'donor' }) => {
  const { t } = useTranslation()

  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 p-base space-y-md bg-surface-container-lowest border-r border-surface-container-high w-64 z-50">
      {/* Logo / Brand */}
      <div className="px-base py-lg">
        {role === 'donor' ? (
          <div className="flex items-center gap-sm mb-lg">
            <img
              src={logoUrl}
              alt={t('appName', 'OutBackShare')}
              style={{ height: '36px', width: 'auto', display: 'block' }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-sm mb-lg">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-primary">sustainability</span>
            </div>
            <div>
              <span className="text-headline-md font-black text-primary block leading-tight">OutBackShare</span>
              <span className="text-label-sm text-on-surface-variant">Community Stewardship</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav>
          <ul className="space-y-xs">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href || '#'}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault()
                      item.onClick()
                    }
                  }}
                  className={`flex items-center gap-sm px-sm py-3 rounded-xl transition-all text-label-md group ${
                    item.active
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {item.icon ? (
                    <span
                      className={`material-symbols-outlined text-[20px] transition-colors ${
                        item.active ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                      }`}
                    >
                      {item.icon}
                    </span>
                  ) : null}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto px-base py-lg border-t border-surface-container-high space-y-xs">
        {onPostFood ? (
          <button
            type="button"
            onClick={onPostFood}
            className="w-full bg-primary text-on-primary py-3 rounded-xl text-label-md mb-md font-semibold hover:bg-primary-container transition-colors"
          >
            {t('donorWorkspace.cards.post.button', 'Post Food')}
          </button>
        ) : null}

        {onLanguage ? (
          <button
            type="button"
            onClick={onLanguage}
            className="flex items-center gap-sm px-sm py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all w-full text-label-md"
          >
            <span className="material-symbols-outlined text-[20px]">language</span>
            <span>{t('common.language', 'Language')}</span>
          </button>
        ) : null}

        <button
          type="button"
          className="flex items-center gap-sm px-sm py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all w-full text-label-md"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>{t('common.settings', 'Settings')}</span>
        </button>
      </div>
    </aside>
  )
}

export default SideNav
