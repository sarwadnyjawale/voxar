'use client'

import { useState } from 'react'
import Link from 'next/link'

interface DashHeaderProps {
  breadcrumbs: { label: string; href?: string }[]
  planLabel?: string
}

export default function DashHeader({ breadcrumbs, planLabel = 'Pro Plan' }: DashHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <header className="dash-header">
      <div className="header-left">
        <div className="header-breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <span className="breadcrumb-sep">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="breadcrumb-segment">{crumb.label}</Link>
              ) : (
                <span className={`breadcrumb-segment ${i === breadcrumbs.length - 1 ? 'current' : ''}`}>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
        <span className="header-project-tag">● {planLabel}</span>
      </div>
      <div className="header-right">
        <button className="header-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          Help
        </button>
        <div className="header-divider" />
        <button className="header-notif">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          <span className="notif-dot" />
        </button>
        <div className="header-profile-wrap">
          <div className="header-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)}>VK</div>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">VK</div>
                <div>
                  <div className="profile-dropdown-name">Voxar User</div>
                  <div className="profile-dropdown-email">user@voxar.ai</div>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <Link className="profile-dropdown-item" href="/dashboard/settings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Account
              </Link>
              <a className="profile-dropdown-item" href="#">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                Plan
                <span className="profile-plan-badge">Pro</span>
              </a>
              <div className="profile-dropdown-divider" />
              <Link className="profile-dropdown-item profile-dropdown-logout" href="/">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
