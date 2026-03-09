'use client'

import { useState, useEffect } from 'react'
import DashHeader from '@/components/dashboard/DashHeader'
import { useAuthStore } from '@/stores/authStore'
import { useUsageStore } from '@/stores/usageStore'
import { IconCopy, IconCheck } from '@/components/landing/Icons'

type SettingsTab = 'profile' | 'billing' | 'api'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { usage, fetchUsage } = useUsageStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [keyCopied, setKeyCopied] = useState(false)

  // Load usage on first render
  useEffect(() => {
    if (!usage) fetchUsage()
  }, [])

  const copyKey = () => {
    navigator.clipboard.writeText('vxr_live_sk_xxxxxxxxxxxxxxxxxxxxxx')
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const usagePercent = (used: number, total: number) => Math.min(Math.round((used / total) * 100), 100)

  return (
    <>
      <DashHeader
        breadcrumbs={[
          { label: 'Studio' },
          { label: 'Settings' }
        ]}
      />

      <div className="dp-scroll">
        <div className="dp-narrow">
          <div className="dp-header">
            <h2 className="dp-title">Settings</h2>
            <p className="dp-subtitle">Manage your profile, subscription, and API access.</p>
          </div>

          <div className="dp-settings-layout">
            {/* Sidebar Nav */}
            <div className="dp-settings-nav">
              <button
                className={`dp-settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </button>
              <button
                className={`dp-settings-tab ${activeTab === 'billing' ? 'active' : ''}`}
                onClick={() => setActiveTab('billing')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Billing & Plan
              </button>
              <button
                className={`dp-settings-tab ${activeTab === 'api' ? 'active' : ''}`}
                onClick={() => setActiveTab('api')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                </svg>
                API Keys
              </button>
            </div>

            {/* Content */}
            <div className="dp-settings-content">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="glass-card glass-card--no-hover">
                  <div className="dp-section-title">Profile Information</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                    <div className="dp-avatar">
                      {user?.name?.[0] || 'V'}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {user?.name || 'Voxar User'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {user?.email || 'user@voxar.in'}
                      </div>
                      <button className="btn-secondary-action" style={{ padding: '7px 16px', fontSize: '12px' }}>Change Avatar</button>
                    </div>
                  </div>

                  <div className="dp-form-group">
                    <label className="dp-form-label">Full Name</label>
                    <input type="text" className="dp-input" defaultValue={user?.name || ''} placeholder="Enter your name" />
                  </div>

                  <div className="dp-form-group">
                    <label className="dp-form-label">Email Address</label>
                    <input type="email" className="dp-input" defaultValue={user?.email || ''} disabled />
                    <span className="dp-form-hint">Email cannot be changed. Contact support for assistance.</span>
                  </div>

                  <button className="btn-generate" style={{ marginTop: '8px' }}>Save Changes</button>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div>
                  {/* Current Plan */}
                  <div className="glass-card glass-card--no-hover" style={{ marginBottom: '20px' }}>
                    <div className="dp-section-title">Current Plan</div>
                    <div className="dp-plan-card">
                      <div>
                        <div className="dp-plan-name">
                          {usage?.plan || 'Starter'} Plan
                          <span className="dp-plan-badge">Active</span>
                        </div>
                        <div className="dp-plan-meta">Billed monthly. Next billing: Apr 7, 2026.</div>
                      </div>
                      <button className="btn-secondary-action">Manage</button>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="glass-card glass-card--no-hover">
                    <div className="dp-section-title">Usage This Cycle</div>
                    <div className="dp-usage-grid">
                      <div className="dp-usage-item">
                        <div className="dp-usage-label">TTS Generation</div>
                        <div className="dp-usage-value">
                          {usage?.tts_minutes_used || 0} <span>/ {usage?.tts_minutes_total || 0} min</span>
                        </div>
                        <div className="dp-usage-track">
                          <div
                            className={`dp-usage-fill ${usagePercent(usage?.tts_minutes_used || 0, usage?.tts_minutes_total || 1) > 80 ? 'dp-usage-fill--warn' : ''}`}
                            style={{ width: `${usagePercent(usage?.tts_minutes_used || 0, usage?.tts_minutes_total || 1)}%` }}
                          />
                        </div>
                      </div>

                      <div className="dp-usage-item">
                        <div className="dp-usage-label">Transcription</div>
                        <div className="dp-usage-value">
                          {usage?.stt_minutes_used || 0} <span>/ {usage?.stt_minutes_total || 0} min</span>
                        </div>
                        <div className="dp-usage-track">
                          <div
                            className="dp-usage-fill"
                            style={{ width: `${usagePercent(usage?.stt_minutes_used || 0, usage?.stt_minutes_total || 1)}%` }}
                          />
                        </div>
                      </div>

                      <div className="dp-usage-item">
                        <div className="dp-usage-label">Voice Clones</div>
                        <div className="dp-usage-value">
                          {usage?.clones_used || 0} <span>/ {usage?.clones_total || 0}</span>
                        </div>
                        <div className="dp-usage-track">
                          <div
                            className="dp-usage-fill"
                            style={{ width: `${usagePercent(usage?.clones_used || 0, usage?.clones_total || 1)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Tab */}
              {activeTab === 'api' && (
                <div className="glass-card glass-card--no-hover">
                  <div className="dp-section-title">API Keys</div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                    Use API keys to authenticate requests to the VOXAR API. Keep these secret and never share them publicly.
                  </p>

                  <div className="dp-key-row">
                    <span className="dp-key-name">Production</span>
                    <span className="dp-key-value">vxr_live_sk_****************************</span>
                    <span className="dp-key-date">Mar 5, 2026</span>
                    <div className="dp-key-actions">
                      <button className="dp-icon-btn" onClick={copyKey} title={keyCopied ? 'Copied!' : 'Copy key'}>
                        {keyCopied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="dp-key-row">
                    <span className="dp-key-name">Development</span>
                    <span className="dp-key-value">vxr_test_sk_****************************</span>
                    <span className="dp-key-date">Mar 1, 2026</span>
                    <div className="dp-key-actions">
                      <button className="dp-icon-btn" title="Copy key">
                        <IconCopy size={14} />
                      </button>
                    </div>
                  </div>

                  <button className="btn-generate" style={{ marginTop: '20px' }}>
                    Create New Key
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
