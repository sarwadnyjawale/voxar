'use client'

import { useState, useEffect } from 'react'
import DashHeader from '@/components/dashboard/DashHeader'
import { IconDownload, IconPlay } from '@/components/landing/Icons'
import { api } from '@/lib/api'

type HistoryType = 'All' | 'TTS' | 'STT' | 'Clone'

interface HistoryRecord {
  _id: string
  type: 'tts' | 'stt' | 'clone'
  text?: string
  clone_name?: string
  voice?: string
  language?: string
  duration?: number
  audio_url?: string
  format?: string
  status: string
  created_at: string
}

interface HistoryResponse {
  records: HistoryRecord[]
  total: number
  counts: { all: number; tts: number; stt: number; clone: number }
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<HistoryType>('All')
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [counts, setCounts] = useState({ all: 0, tts: 0, stt: 0, clone: 0 })
  const [isLoading, setIsLoading] = useState(true)

  const fetchHistory = async (type?: string) => {
    setIsLoading(true)
    try {
      const query = type && type !== 'All' ? `?type=${type.toLowerCase()}` : ''
      const data = await api.backendGet<HistoryResponse>(`/api/v1/history${query}`)
      setRecords(data.records || [])
      setCounts(data.counts || { all: 0, tts: 0, stt: 0, clone: 0 })
    } catch {
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory(activeTab)
  }, [activeTab])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000 && d.getDate() === now.getDate()) {
      return `Today, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    }
    if (diff < 172800000) {
      return `Yesterday, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatDuration = (sec?: number) => {
    if (!sec) return '-'
    const m = Math.floor(sec / 60)
    const s = Math.round(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const getTitle = (r: HistoryRecord) => {
    if (r.type === 'clone') return r.clone_name || 'Voice Clone'
    return r.text ? (r.text.length > 60 ? r.text.slice(0, 60) + '...' : r.text) : '-'
  }

  const badgeClass = (type: string) => {
    switch (type) {
      case 'tts': return 'dp-type-badge dp-type-badge--tts'
      case 'stt': return 'dp-type-badge dp-type-badge--stt'
      case 'clone': return 'dp-type-badge dp-type-badge--clone'
      default: return 'dp-type-badge'
    }
  }

  const handlePlay = (url?: string) => {
    if (!url) return
    const audio = new Audio(url)
    audio.play().catch(() => {})
  }

  const handleDownload = (url?: string) => {
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `voxar-audio.${url.split('.').pop() || 'wav'}`
    a.click()
  }

  return (
    <>
      <DashHeader
        breadcrumbs={[
          { label: 'Studio' },
          { label: 'Generation History' }
        ]}
      />

      <div className="dp-scroll">
        <div className="dp-header">
          <div className="dp-header-row">
            <div>
              <h2 className="dp-title">History</h2>
              <p className="dp-subtitle">View and manage all your past generations, transcriptions, and voice clones.</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="dp-tabs">
          {(['All', 'TTS', 'STT', 'Clone'] as HistoryType[]).map(tab => (
            <button
              key={tab}
              className={`dp-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab !== 'All' && (
                <span style={{ marginLeft: '6px', opacity: 0.5 }}>
                  {counts[tab.toLowerCase() as keyof typeof counts] || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="dp-empty">
            <p className="dp-empty-desc">Loading history...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="dp-empty">
            <div className="dp-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="dp-empty-title">No {activeTab !== 'All' ? activeTab : ''} history yet</h3>
            <p className="dp-empty-desc">Your generations will appear here once you start creating.</p>
          </div>
        ) : (
          <div className="dp-table-wrap">
            <table className="dp-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Content</th>
                  <th>Voice</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th style={{ width: '100px' }}></th>
                </tr>
              </thead>
              <tbody>
                {records.map(item => (
                  <tr key={item._id}>
                    <td>
                      <span className={badgeClass(item.type)}>{item.type.toUpperCase()}</span>
                    </td>
                    <td>
                      <span className="dp-table-title">{getTitle(item)}</span>
                    </td>
                    <td>
                      <span className="dp-table-muted">{item.voice || '-'}</span>
                    </td>
                    <td>
                      <span className="dp-table-mono">{formatDuration(item.duration)}</span>
                    </td>
                    <td>
                      <span className="dp-table-muted">{formatDate(item.created_at)}</span>
                    </td>
                    <td>
                      <div className="dp-table-actions">
                        {item.audio_url && (
                          <>
                            <button className="dp-icon-btn" title="Play" onClick={() => handlePlay(item.audio_url)}>
                              <IconPlay size={14} />
                            </button>
                            <button className="dp-icon-btn" title="Download" onClick={() => handleDownload(item.audio_url)}>
                              <IconDownload size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
