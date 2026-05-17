import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import WorkspaceFeatureNav from './WorkspaceFeatureNav'

const OrgFeatureNav = ({ active = 'listings', orgCode = '' }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const goTo = (path) => {
    navigate(path, { state: { orgCode } })
  }

  return (
    <WorkspaceFeatureNav
      role="org"
      ariaLabel={t('common.navigation', 'Organization navigation')}
      items={[
        {
          key: 'listings',
          label: t('dashboard.title'),
          active: active === 'listings',
          onClick: () => goTo('/org/listings'),
        },
        {
          key: 'intelligence',
          label: 'Area Intelligence',
          active: active === 'intelligence',
          onClick: () => goTo('/org/intelligence'),
        },
        {
          key: 'coverage-map',
          label: t('coverageMap.navLabel', 'Around me'),
          active: active === 'coverage-map',
          onClick: () => goTo('/org/coverage-map'),
        },
      ]}
    />
  )
}

export default OrgFeatureNav
