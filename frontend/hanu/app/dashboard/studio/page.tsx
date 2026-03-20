'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import DashHeader from '@/components/dashboard/DashHeader'
import { IconPlay, IconPlus, IconCopy, IconCheck } from '@/components/landing/Icons'
import { useStudioStore } from '@/stores/studioStore'
import { useVoiceStore, CatalogVoice, ClonedVoice } from '@/stores/voiceStore'

export default function StudioPage() {
  const {
    projectName, setProjectName,
    blocks, activeBlockId, setActiveBlock,
    format, setFormat, enhance, setEnhance, normalize, setNormalize, volume, setVolume,
    addBlock, deleteBlock, duplicateBlock, updateBlockText, updateBlockSettings,
    generateBlock, generateAll, stopGenerateAll, isGeneratingAll, generatingBlockId, generationProgress,
    playBlock, playAll, stopPlayback, isPlaying, currentPlayBlockIdx, audioElement,
  } = useStudioStore()

  const { voices, clonedVoices, fetchVoices, fetchClonedVoices } = useVoiceStore()

  const [voiceDropdownBlockId, setVoiceDropdownBlockId] = useState<string | null>(null)
  const volumeRef = useRef<HTMLDivElement>(null)

  // Fetch real voices on mount
  useEffect(() => {
    fetchVoices()
    fetchClonedVoices()
  }, [fetchVoices, fetchClonedVoices])

  // All available voices (catalog + cloned)
  const allVoices: { id: string; name: string; type: 'catalog' | 'cloned'; lang?: string }[] = [
    ...voices.map((v: CatalogVoice) => ({
      id: v.id,
      name: v.display_name || v.name,
      type: 'catalog' as const,
      lang: v.primary_language || (v.languages?.[0]),
    })),
    ...clonedVoices
      .filter((v: ClonedVoice) => v.status === 'ready')
      .map((v: ClonedVoice) => ({
        id: v._id,
        name: `${v.name} (Clone)`,
        type: 'cloned' as const,
        lang: v.language,
      })),
  ]

  const totalDuration = blocks.reduce((sum, b) => sum + b.duration, 0)
  const totalChars = blocks.reduce((sum, b) => sum + b.text.trim().length, 0)
  const pendingCount = blocks.filter(b => b.text.trim() && (b.dirty || b.status !== 'done')).length

  const handleVolumeClick = useCallback((e: React.MouseEvent) => {
    if (!volumeRef.current) return
    const rect = volumeRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)))
    setVolume(pct)
  }, [setVolume])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const getVoiceColor = (voiceId: string): string => {
    // Generate a consistent color from voice ID
    const colors = [
      'linear-gradient(135deg,#ff6b6b,#ee5a24)',
      'linear-gradient(135deg,#a29bfe,#6c5ce7)',
      'linear-gradient(135deg,#00cec9,#0984e3)',
      'linear-gradient(135deg,#fd79a8,#e84393)',
      'linear-gradient(135deg,#f9ca24,#f0932b)',
      'linear-gradient(135deg,#55efc4,#00b894)',
      'linear-gradient(135deg,#74b9ff,#0984e3)',
      'linear-gradient(135deg,#e17055,#d63031)',
    ]
    let hash = 0
    for (let i = 0; i < voiceId.length; i++) hash = ((hash << 5) - hash + voiceId.charCodeAt(i)) | 0
    return colors[Math.abs(hash) % colors.length]
  }

  const selectVoice = (blockId: string, voiceId: string, voiceName: string) => {
    updateBlockSettings(blockId, { voiceId, voiceName })
    setVoiceDropdownBlockId(null)
  }

  // Close dropdown on outside click
  useEffect(() => {
    if (!voiceDropdownBlockId) return
    const close = () => setVoiceDropdownBlockId(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [voiceDropdownBlockId])

  return (
    <>
      <DashHeader
        breadcrumbs={[
          { label: 'Studio' },
          { label: 'Editor' }
        ]}
      />

      <div className="studio-layout">
        {/* Left Panel — Controls */}
        <div className="studio-left">
          <div className="studio-left-header">
            <div className="studio-left-title">Controls</div>
          </div>
          <div className="studio-left-body">
            {/* Playback */}
            <div className="studio-left-section">
              <div className="studio-left-section-title">Playback</div>
              <div className="control-group">
                <div className="slider-control">
                  <div className="slider-header">
                    <span className="slider-label">Volume</span>
                    <span className="slider-value">{volume}%</span>
                  </div>
                  <div className="slider-track" ref={volumeRef} onClick={handleVolumeClick}>
                    <div className="slider-fill" style={{ width: `${volume}%` }} />
                    <div className="slider-thumb" style={{ left: `${volume}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="controls-divider" />

            {/* Output */}
            <div className="studio-left-section">
              <div className="studio-left-section-title">Output Format</div>
              <div className="format-options">
                {['mp3', 'wav'].map(f => (
                  <button
                    key={f}
                    className={`format-chip ${f === format ? 'active' : ''}`}
                    onClick={() => setFormat(f)}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="controls-divider" />

            {/* AI Tools */}
            <div className="studio-left-section">
              <div className="studio-left-section-title">AI Tools</div>
              <div className="toggle-control">
                <div className="toggle-info">
                  <span className="toggle-label">Audio Enhancement</span>
                  <span className="toggle-desc">Denoise & clarity boost</span>
                </div>
                <div className={`toggle-switch ${enhance ? 'active' : ''}`} onClick={() => setEnhance(!enhance)}>
                  <div className="toggle-knob" />
                </div>
              </div>
              <div className="toggle-control">
                <div className="toggle-info">
                  <span className="toggle-label">Loudness Normalize</span>
                  <span className="toggle-desc">Consistent volume</span>
                </div>
                <div className={`toggle-switch ${normalize ? 'active' : ''}`} onClick={() => setNormalize(!normalize)}>
                  <div className="toggle-knob" />
                </div>
              </div>
            </div>

            <div className="controls-divider" />

            {/* Info */}
            <div className="studio-left-section">
              <div className="studio-left-section-title">Project Stats</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Blocks</span><span style={{ color: 'var(--text-secondary)' }}>{blocks.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Characters</span><span style={{ color: 'var(--text-secondary)' }}>{totalChars.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Duration</span><span style={{ color: 'var(--text-secondary)' }}>{formatTime(totalDuration)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pending</span><span style={{ color: pendingCount > 0 ? 'var(--text-primary)' : 'var(--text-dim)' }}>{pendingCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel — Script Editor */}
        <div className="studio-center">
          <div className="studio-toolbar">
            <div className="studio-toolbar-left">
              <input
                type="text"
                className="studio-project-name"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
              />
              {isGeneratingAll && generationProgress && (
                <span className="studio-project-status" style={{ color: 'var(--accent-light)' }}>
                  <span className="studio-project-dot" style={{ background: 'var(--accent)', animation: 'pulse 1s infinite' }} />
                  Generating {generationProgress.current}/{generationProgress.total}
                </span>
              )}
            </div>
            <div className="studio-toolbar-right">
              <span className="char-count">{blocks.length} blocks · {totalChars.toLocaleString()} chars</span>
              {isGeneratingAll ? (
                <button
                  className="btn-secondary-action"
                  style={{ padding: '8px 20px', fontSize: '12px' }}
                  onClick={stopGenerateAll}
                >
                  Stop
                </button>
              ) : (
                <button
                  className="btn-generate"
                  style={{ padding: '8px 20px', fontSize: '12px' }}
                  onClick={() => generateAll()}
                  disabled={pendingCount === 0}
                >
                  {pendingCount > 0 ? `Generate ${pendingCount > 1 ? `All (${pendingCount})` : ''}` : 'All Generated'}
                </button>
              )}
            </div>
          </div>

          {/* Script Blocks */}
          <div className="studio-blocks">
            {blocks.map((block, i) => (
              <div
                key={block.id}
                className={`studio-block ${activeBlockId === block.id ? 'active' : ''} ${block.status === 'generating' ? 'generating' : ''}`}
                onClick={() => setActiveBlock(block.id)}
              >
                {/* Voice selector */}
                <div className="studio-block-voice" style={{ position: 'relative' }}>
                  <div
                    className="studio-block-avatar"
                    style={{ background: getVoiceColor(block.voiceId) }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setVoiceDropdownBlockId(voiceDropdownBlockId === block.id ? null : block.id)
                    }}
                    title="Click to change voice"
                  >
                    {block.voiceName[0]}
                  </div>
                  <span className="studio-block-voice-name">{block.voiceName}</span>

                  {/* Voice dropdown */}
                  {voiceDropdownBlockId === block.id && (
                    <div
                      className="studio-voice-dropdown"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 100,
                        width: '220px',
                        maxHeight: '240px',
                        overflowY: 'auto',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        padding: '4px',
                        marginTop: '4px',
                      }}
                    >
                      {allVoices.length === 0 && (
                        <div style={{ padding: '12px', fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center' }}>
                          Loading voices...
                        </div>
                      )}
                      {allVoices.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => selectVoice(block.id, v.id, v.name)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: v.id === block.voiceId ? 'var(--bg-glass-hover)' : 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-glass-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = v.id === block.voiceId ? 'var(--bg-glass-hover)' : 'transparent')}
                        >
                          <span
                            style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: getVoiceColor(v.id),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '10px', fontWeight: 700, color: '#fff', flexShrink: 0,
                            }}
                          >
                            {v.name[0]}
                          </span>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.name}
                          </span>
                          {v.type === 'cloned' && (
                            <span style={{ fontSize: '9px', color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '1px 5px', borderRadius: '4px' }}>
                              CLONE
                            </span>
                          )}
                          {v.lang && (
                            <span style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                              {v.lang}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Per-block settings row */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                  <select
                    className="model-select"
                    value={block.engine}
                    onChange={(e) => { e.stopPropagation(); updateBlockSettings(block.id, { engine: e.target.value }) }}
                    style={{ padding: '3px 6px', fontSize: '10px', width: 'auto', minWidth: '80px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="flash">Flash</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="longform">Longform</option>
                    <option value="multilingual">Multilingual</option>
                  </select>
                  <select
                    className="model-select"
                    value={block.language}
                    onChange={(e) => { e.stopPropagation(); updateBlockSettings(block.id, { language: e.target.value }) }}
                    style={{ padding: '3px 6px', fontSize: '10px', width: 'auto', minWidth: '60px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="auto">Auto</option>
                    <option value="en">EN</option>
                    <option value="hi">HI</option>
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
                  <select
                    className="model-select"
                    value={String(block.speed)}
                    onChange={(e) => { e.stopPropagation(); updateBlockSettings(block.id, { speed: parseFloat(e.target.value) }) }}
                    style={{ padding: '3px 6px', fontSize: '10px', width: 'auto', minWidth: '55px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(s => (
                      <option key={s} value={String(s)}>{s}x</option>
                    ))}
                  </select>
                </div>

                {/* Text */}
                <div className="studio-block-content">
                  <textarea
                    className="studio-block-text"
                    value={block.text}
                    onChange={e => updateBlockText(block.id, e.target.value)}
                    placeholder="Type your text here..."
                    rows={Math.max(1, Math.ceil(block.text.length / 80))}
                  />
                </div>

                {/* Actions */}
                <div className="studio-block-actions">
                  {/* Status indicator */}
                  {block.status === 'generating' && (
                    <span style={{ fontSize: '9px', color: 'var(--accent-light)', marginRight: '4px' }}>Generating...</span>
                  )}
                  {block.status === 'done' && !block.dirty && (
                    <span style={{ fontSize: '9px', color: 'var(--success)', marginRight: '4px' }}>Ready</span>
                  )}
                  {block.status === 'done' && block.dirty && (
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginRight: '4px' }}>Modified</span>
                  )}
                  {block.status === 'error' && (
                    <span style={{ fontSize: '9px', color: '#ef4444', marginRight: '4px' }} title={block.error || ''}>Error</span>
                  )}

                  {/* Play block */}
                  <button
                    className="studio-block-btn"
                    title={block.audioUrl ? 'Play block' : 'Generate first'}
                    onClick={(e) => { e.stopPropagation(); if (block.audioUrl) playBlock(block.id) }}
                    style={{ opacity: block.audioUrl ? 1 : 0.3 }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </button>

                  {/* Generate/Regenerate this block */}
                  <button
                    className="studio-block-btn"
                    title={block.status === 'done' ? 'Regenerate' : 'Generate'}
                    onClick={(e) => { e.stopPropagation(); generateBlock(block.id) }}
                    style={{ opacity: block.status === 'generating' ? 0.3 : 1 }}
                  >
                    {block.status === 'generating' ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'loginSpin 1s linear infinite' }}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                    )}
                  </button>

                  {/* Duplicate */}
                  <button className="studio-block-btn" title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id) }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  </button>

                  {/* Delete */}
                  <button className="studio-block-btn studio-block-btn--danger" title="Delete" onClick={(e) => { e.stopPropagation(); deleteBlock(block.id) }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              </div>
            ))}

            <button className="studio-add-block" onClick={() => {
              const newId = addBlock()
              setVoiceDropdownBlockId(newId)
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Speech Block
            </button>
          </div>

          {/* Timeline */}
          <div className="studio-timeline">
            <div className="studio-timeline-controls">
              <button
                className="studio-timeline-play"
                onClick={() => {
                  if (isPlaying) { stopPlayback() } else { playAll() }
                }}
                style={{ opacity: blocks.some(b => b.audioUrl) ? 1 : 0.3 }}
              >
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="6" y1="4" x2="6" y2="20" /><line x1="18" y1="4" x2="18" y2="20" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                )}
              </button>
              <div className="studio-timeline-track">
                <div className="studio-timeline-segments">
                  {blocks.map((block) => (
                    <div
                      key={block.id}
                      className={`studio-timeline-seg ${activeBlockId === block.id ? 'active' : ''}`}
                      style={{
                        flex: block.duration > 0 ? block.duration : Math.max(1, Math.ceil(block.text.split(/\s+/).filter(Boolean).length * 0.4)),
                        opacity: block.audioUrl ? 1 : 0.4,
                      }}
                      onClick={() => {
                        setActiveBlock(block.id)
                        if (block.audioUrl) playBlock(block.id)
                      }}
                    >
                      {block.voiceName.substring(0, 6)}
                    </div>
                  ))}
                </div>
              </div>
              <span className="studio-timeline-time">
                {formatTime(totalDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
