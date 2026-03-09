'use client'

import { useState, useEffect } from 'react'
import { useVoiceStore, type CatalogVoice } from '@/stores/voiceStore'
import DashHeader from '@/components/dashboard/DashHeader'
import { IconSearch, IconPlay } from '@/components/landing/Icons'

const FILTER_CATEGORIES = ['All', 'Cinematic', 'Documentary', 'Poetry', 'Meditation', 'News', 'Professional', 'Storytelling', 'Educational', 'ASMR', 'Drama']

export default function VoicesPage() {
  const { voices, searchQuery, setSearchQuery, playPreview, fetchVoices } = useVoiceStore()
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    if (voices.length === 0) fetchVoices()
  }, [])

  const getVoiceLang = (v: CatalogVoice) => v.primary_language || v.languages?.join(', ') || ''
  const getVoiceStyle = (v: CatalogVoice) => v.styles?.[0] || v.description || ''
  const getVoiceTags = (v: CatalogVoice) => v.tags || []

  const filtered = voices.filter(v =>
    (searchQuery === '' ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getVoiceLang(v).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getVoiceStyle(v).toLowerCase().includes(searchQuery.toLowerCase())) &&
    (activeCategory === 'All' || getVoiceTags(v).includes(activeCategory))
  )

  const handlePreview = (id: string) => {
    setPlayingId(playingId === id ? null : id)
    playPreview(id)
  }

  const VoiceCard = ({ voice }: { voice: CatalogVoice }) => (
    <div className="dp-voice-card">
      <div className="dp-voice-card-top">
        <div className="dp-voice-card-info">
          <div className="dp-voice-avatar track-avatar">
            <div className="avatar-overlay" />
          </div>
          <div>
            <div className="dp-voice-name">
              {voice.display_name || voice.name}
            </div>
            <div className="dp-voice-style">{getVoiceStyle(voice)}</div>
          </div>
        </div>
        <button
          className={`dp-voice-preview ${playingId === voice.id ? 'playing' : ''}`}
          onClick={() => handlePreview(voice.id)}
        >
          {playingId === voice.id ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="4" x2="6" y2="20" /><line x1="18" y1="4" x2="18" y2="20" /></svg>
          ) : (
            <IconPlay size={14} />
          )}
        </button>
      </div>
      <div className="dp-voice-tags">
        <span className="dp-tag dp-tag--accent">{getVoiceLang(voice)}</span>
        {getVoiceTags(voice).map(tag => (
          <span key={tag} className="dp-tag">{tag}</span>
        ))}
      </div>
      <div className="dp-voice-footer">
        <button className="btn-secondary-action">Preview</button>
        <button className="btn-generate">Use Voice</button>
      </div>
    </div>
  )

  return (
    <>
      <DashHeader
        breadcrumbs={[
          { label: 'Studio' },
          { label: 'Voice Library' }
        ]}
      />

      <div className="dp-scroll">
        {/* Header */}
        <div className="dp-header">
          <div className="dp-header-row">
            <div>
              <h2 className="dp-title">Voice Library</h2>
              <p className="dp-subtitle">
                Explore {voices.length} premium neural voices across 12 languages. 240+ voice-language combinations.
              </p>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="dp-section" style={{ marginTop: '8px' }}>
          <div className="dp-voice-section-title" style={{ marginBottom: '16px' }}>All Voices</div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="dp-search">
              <div className="dp-search-icon">
                <IconSearch size={16} />
              </div>
              <input
                type="text"
                className="dp-search-input"
                placeholder="Search by name, style, or language..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="dp-filters">
            {FILTER_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`dp-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Grid */}
        <div className="dp-section-title" style={{ marginTop: '24px' }}>
          {filtered.length} voice{filtered.length !== 1 ? 's' : ''} found
        </div>

        {filtered.length === 0 ? (
          <div className="dp-empty">
            <div className="dp-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
            </div>
            <h3 className="dp-empty-title">No voices match</h3>
            <p className="dp-empty-desc">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="dp-voice-grid">
            {filtered.map(voice => (
              <VoiceCard key={voice.id} voice={voice} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
