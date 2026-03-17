'use client'

import { useState, useEffect } from 'react'
import { useVoiceStore, type CatalogVoice, type ClonedVoice } from '@/stores/voiceStore'
import DashHeader from '@/components/dashboard/DashHeader'
import { IconSearch, IconPlay } from '@/components/landing/Icons'

const FILTER_CATEGORIES = ['All', 'Favorites', 'Cloned', 'Cinematic', 'Documentary', 'Poetry', 'Meditation', 'News', 'Professional', 'Storytelling', 'Educational', 'ASMR', 'Drama']

export default function VoicesPage() {
  const {
    voices, clonedVoices, searchQuery, setSearchQuery, playPreview,
    fetchVoices, fetchClonedVoices, favorites, toggleFavorite, isFavorite,
  } = useVoiceStore()
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    fetchVoices()
    fetchClonedVoices()
  }, [])

  const getVoiceLang = (v: CatalogVoice) => v.primary_language || v.languages?.join(', ') || ''
  const getVoiceStyle = (v: CatalogVoice) => v.styles?.[0] || v.description || ''
  const getVoiceTags = (v: CatalogVoice) => v.tags || []

  // Convert cloned voices to CatalogVoice shape for unified display
  const clonedAsCatalog: CatalogVoice[] = clonedVoices
    .filter((v: ClonedVoice) => v.status === 'ready')
    .map((v: ClonedVoice) => ({
      id: v._id,
      name: v.name,
      display_name: `${v.name} (Clone)`,
      primary_language: v.language,
      tags: ['Cloned'],
      description: `Quality: ${v.quality_score}/100`,
    }))

  const allVoices = [...voices, ...clonedAsCatalog]

  const filtered = allVoices.filter(v => {
    const matchSearch = searchQuery === '' ||
      (v.display_name || v.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getVoiceLang(v).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getVoiceStyle(v).toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchSearch) return false

    if (activeCategory === 'All') return true
    if (activeCategory === 'Favorites') return isFavorite(v.id)
    if (activeCategory === 'Cloned') return getVoiceTags(v).includes('Cloned')
    return getVoiceTags(v).includes(activeCategory)
  })

  const handlePreview = (id: string) => {
    setPlayingId(playingId === id ? null : id)
    playPreview(id)
  }

  const VoiceCard = ({ voice }: { voice: CatalogVoice }) => {
    const fav = isFavorite(voice.id)
    const isClone = getVoiceTags(voice).includes('Cloned')

    return (
      <div className="dp-voice-card">
        <div className="dp-voice-card-top">
          <div className="dp-voice-card-info">
            <div className="dp-voice-avatar track-avatar" style={isClone ? { background: 'linear-gradient(135deg, var(--accent-glow), var(--bg-glass))' } : {}}>
              <div className="avatar-overlay" />
            </div>
            <div>
              <div className="dp-voice-name">
                {voice.display_name || voice.name}
              </div>
              <div className="dp-voice-style">{getVoiceStyle(voice)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Favorite button */}
            <button
              onClick={() => toggleFavorite(voice.id)}
              title={fav ? 'Remove from favorites' : 'Add to favorites'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                color: fav ? '#f59e0b' : 'var(--text-dim)',
                transition: 'color 0.2s, transform 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill={fav ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
            {/* Play button */}
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
        </div>
        <div className="dp-voice-tags">
          <span className="dp-tag dp-tag--accent">{getVoiceLang(voice)}</span>
          {isClone && <span className="dp-tag" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)' }}>CLONE</span>}
          {fav && <span className="dp-tag" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>FAV</span>}
          {getVoiceTags(voice).filter(t => t !== 'Cloned').map(tag => (
            <span key={tag} className="dp-tag">{tag}</span>
          ))}
        </div>
        <div className="dp-voice-footer">
          <button className="btn-secondary-action" onClick={() => handlePreview(voice.id)}>Preview</button>
          <a href="/dashboard/tts" className="btn-generate" style={{ textDecoration: 'none' }}>Use Voice</a>
        </div>
      </div>
    )
  }

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
                Explore {voices.length} premium neural voices{clonedAsCatalog.length > 0 ? ` + ${clonedAsCatalog.length} cloned` : ''} across 12 languages.
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
                {cat === 'Favorites' && favorites.length > 0 && (
                  <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.7 }}>({favorites.length})</span>
                )}
                {cat === 'Cloned' && clonedAsCatalog.length > 0 && (
                  <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.7 }}>({clonedAsCatalog.length})</span>
                )}
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
            <h3 className="dp-empty-title">
              {activeCategory === 'Favorites' ? 'No favorites yet' : 'No voices match'}
            </h3>
            <p className="dp-empty-desc">
              {activeCategory === 'Favorites'
                ? 'Star voices to add them to your favorites for quick access.'
                : 'Try a different search or filter.'}
            </p>
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
