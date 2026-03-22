'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { useTTSStore } from '@/stores/ttsStore'
import { useVoiceStore, type CatalogVoice } from '@/stores/voiceStore'

const getVoiceFirstName = (v: CatalogVoice) => {
  if (v.display_name) return v.display_name.split(' — ')[0]
  return v.name
}

const getVoiceGradientClass = (id: string) => {
  if (id.startsWith('v0') || id.startsWith('v')) return `voice-gradient-${id}`
  return 'voice-gradient-cloned'
}

export default function ControlsPanel() {
  const {
    voice, engine, stability, speed, format, language, enhance, normalize,
    updateSettings
  } = useTTSStore()

  const { voices, clonedVoices, fetchVoices, fetchClonedVoices, favorites, isFavorite, playPreview } = useVoiceStore()
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false)

  const stabilityRef = useRef<HTMLDivElement>(null)
  const speedRef = useRef<HTMLDivElement>(null)

  // Load voices on mount
  useEffect(() => {
    if (voices.length === 0) fetchVoices()
    fetchClonedVoices()
  }, [])

  const selectedVoice = voices.find(v => v.id === voice) || null

  // Favorite voices for quick pick
  const favoriteVoices = voices.filter(v => isFavorite(v.id))

  const selectVoice = (v: CatalogVoice) => {
    updateSettings({ voice: v.id })
    setShowVoiceDropdown(false)
  }

  // Slider logic
  const useSlider = (ref: React.RefObject<HTMLDivElement | null>, value: number, setValue: (v: number) => void, min: number, max: number, step: number) => {
    const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const raw = min + pct * (max - min)
      const snapped = Math.round(raw / step) * step
      setValue(Math.max(min, Math.min(max, snapped)))
    }, [ref, min, max, step, setValue])

    const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      const move = (ev: MouseEvent | TouchEvent) => handleDrag(ev)
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.removeEventListener('touchmove', move); document.removeEventListener('touchend', up) }
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
      document.addEventListener('touchmove', move)
      document.addEventListener('touchend', up)
    }, [handleDrag])

    const pct = ((value - min) / (max - min)) * 100
    return { handleStart, pct }
  }

  const stabilitySlider = useSlider(stabilityRef, stability, (v) => updateSettings({ stability: v }), 0, 100, 1)
  const speedSlider = useSlider(speedRef, speed, (v) => updateSettings({ speed: v }), 0.5, 2.0, 0.1)

  return (
    <div className="controls-body">
      {/* Saved Voices Quick Pick */}
      {favoriteVoices.length > 0 && (
        <div className="control-group">
          <div className="control-label">Saved Voices</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {favoriteVoices.map(v => (
              <button
                key={v.id}
                onClick={() => updateSettings({ voice: v.id })}
                style={{
                  padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                  background: v.id === voice ? 'var(--btn-solid)' : 'var(--bg-glass)',
                  color: v.id === voice ? 'var(--btn-solid-text)' : 'var(--text-secondary)',
                }}
              >
                {getVoiceFirstName(v)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Selector */}
      <div className="control-group">
        <div className="control-label">Voice <span className="control-label-hint">TAP TO CHANGE</span></div>
        <div className="voice-selector" onClick={() => setShowVoiceDropdown(!showVoiceDropdown)} style={{ cursor: 'pointer', position: 'relative' }}>
          <div className={`voice-avatar ${selectedVoice ? getVoiceGradientClass(selectedVoice.id) : ''}`} />
          <div className="voice-info">
            <div className="voice-name">{selectedVoice ? getVoiceFirstName(selectedVoice) : 'Select Voice'}</div>
            <div className="voice-meta">
              {selectedVoice ? `${selectedVoice.styles?.[0] || ''} ${selectedVoice.primary_language ? `\u00b7 ${selectedVoice.primary_language.toUpperCase()}` : ''}` : 'Loading voices...'}
            </div>
          </div>
          <svg className="voice-selector-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </div>

        {/* Voice Dropdown */}
        {showVoiceDropdown && (
          <div className="glass-card" style={{
            position: 'absolute', zIndex: 50, maxHeight: '280px', overflowY: 'auto',
            width: 'calc(100% - 32px)', marginTop: '4px', padding: '6px',
          }}>
            {voices.map(v => (
              <div
                key={v.id}
                onClick={() => selectVoice(v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                  background: v.id === voice ? 'rgba(139,92,246,0.12)' : 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = v.id === voice ? 'rgba(139,92,246,0.12)' : 'transparent')}
              >
                <div className={`voice-avatar ${getVoiceGradientClass(v.id)}`} style={{ width: 28, height: 28, fontSize: 11, borderRadius: '50%' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{getVoiceFirstName(v)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {v.primary_language?.toUpperCase()} {v.styles?.[0] ? `\u00b7 ${v.styles[0]}` : ''}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); playPreview(v.id) }}
                  title="Preview"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </button>
                {v.id === voice && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engine */}
      <div className="control-group">
        <div className="control-label">Engine</div>
        <select className="model-select" value={engine} onChange={e => updateSettings({ engine: e.target.value })}>
          <option value="flash">Flash — Low Latency</option>
          <option value="cinematic">Cinematic — Studio Grade</option>
          <option value="longform">Longform — Audiobooks</option>
          <option value="multilingual">Multilingual — 12 Languages</option>
        </select>
      </div>

      {/* Stability */}
      <div className="control-group">
        <div className="slider-control">
          <div className="slider-header">
            <span className="slider-label">Stability</span>
            <span className="slider-value">{stability}%</span>
          </div>
          <div className="slider-track" ref={stabilityRef} onMouseDown={e => { stabilitySlider.handleStart(e); const rect = stabilityRef.current!.getBoundingClientRect(); const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); updateSettings({ stability: Math.round(pct * 100) }) }}>
            <div className="slider-fill" style={{ width: `${stabilitySlider.pct}%` }} />
            <div className="slider-thumb" style={{ left: `${stabilitySlider.pct}%` }} onMouseDown={stabilitySlider.handleStart} onTouchStart={stabilitySlider.handleStart} />
          </div>
          <p className="slider-desc">Higher = more consistent. Lower = more expressive.</p>
        </div>
      </div>

      {/* Speed */}
      <div className="control-group">
        <div className="slider-control">
          <div className="slider-header">
            <span className="slider-label">Speed</span>
            <span className="slider-value">{speed.toFixed(1)}x</span>
          </div>
          <div className="slider-track" ref={speedRef} onMouseDown={e => { speedSlider.handleStart(e); const rect = speedRef.current!.getBoundingClientRect(); const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); updateSettings({ speed: Math.round((0.5 + pct * 1.5) * 10) / 10 }) }}>
            <div className="slider-fill" style={{ width: `${speedSlider.pct}%` }} />
            <div className="slider-thumb" style={{ left: `${speedSlider.pct}%` }} onMouseDown={speedSlider.handleStart} onTouchStart={speedSlider.handleStart} />
          </div>
        </div>
      </div>

      <div className="controls-divider" />

      {/* Language */}
      <div className="control-group">
        <div className="control-label">Language</div>
        <select className="lang-select" value={language} onChange={e => updateSettings({ language: e.target.value })}>
          <option value="auto">Auto-detect</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="hinglish">Hinglish</option>
          <option value="mr">Marathi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="bn">Bengali</option>
          <option value="kn">Kannada</option>
          <option value="ml">Malayalam</option>
          <option value="gu">Gujarati</option>
          <option value="pa">Punjabi</option>
          <option value="or">Odia</option>
        </select>
      </div>

      {/* Format */}
      <div className="control-group">
        <div className="control-label">Output Format</div>
        <div className="format-options">
          {['mp3', 'wav'].map(f => (
            <button key={f} className={`format-chip ${format === f ? 'active' : ''}`} onClick={() => updateSettings({ format: f })}>{f.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div className="controls-divider" />
      <div className="controls-section-title">Post-Processing</div>

      {/* Toggles */}
      <div className="toggle-control">
        <div className="toggle-info">
          <span className="toggle-label">Audio Enhancement</span>
          <span className="toggle-desc">AI noise removal & clarity boost</span>
        </div>
        <div className={`toggle-switch ${enhance ? 'active' : ''}`} onClick={() => updateSettings({ enhance: !enhance })}>
          <div className="toggle-knob" />
        </div>
      </div>
      <div className="toggle-control">
        <div className="toggle-info">
          <span className="toggle-label">Loudness Normalize</span>
          <span className="toggle-desc">Normalize to -14 LUFS</span>
        </div>
        <div className={`toggle-switch ${normalize ? 'active' : ''}`} onClick={() => updateSettings({ normalize: !normalize })}>
          <div className="toggle-knob" />
        </div>
      </div>
    </div>
  )
}
