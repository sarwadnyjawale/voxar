'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export default function DashboardPage() {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('Arjun')
  const [engine, setEngine] = useState('cinematic')
  const [stability, setStability] = useState(72)
  const [speed, setSpeed] = useState(1.0)
  const [format, setFormat] = useState('mp3')
  const [language, setLanguage] = useState('auto')
  const [enhance, setEnhance] = useState(true)
  const [normalize, setNormalize] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [playProgress, setPlayProgress] = useState(0)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stabilityRef = useRef<HTMLDivElement>(null)
  const speedRef = useRef<HTMLDivElement>(null)

  const charCount = text.length
  const maxChars = 5000
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  // Theme persistence
  useEffect(() => {
    const saved = localStorage.getItem('voxar-theme')
    if (saved === 'light') document.body.classList.add('light-mode')
  }, [])

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

  const stabilitySlider = useSlider(stabilityRef, stability, setStability, 0, 100, 1)
  const speedSlider = useSlider(speedRef, speed, setSpeed, 0.5, 2.0, 0.1)

  const handleGenerate = () => {
    if (!text.trim()) return
    setGenerating(true)
    setExportFormat(null)
    setTimeout(() => {
      setGenerating(false)
      setShowPlayer(true)
      setPlayProgress(0)
      setExportFormat('mp3')
    }, 2500)
  }

  // Play/Pause with progress
  useEffect(() => {
    if (playing) {
      playIntervalRef.current = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 100) {
            setPlaying(false)
            return 100
          }
          return prev + 0.5
        })
      }, 70)
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current) }
  }, [playing])

  const historyItems = [
    { text: 'Welcome to the future of voice...', time: '2m ago', dur: '0:14', voice: 'Arjun', date: 'Today' },
    { text: 'In this episode we explore...', time: '1h ago', dur: '0:32', voice: 'Priya', date: 'Today' },
    { text: 'Breaking news from the tech...', time: '3h ago', dur: '0:08', voice: 'Vikram', date: 'Yesterday' },
    { text: 'The art of storytelling begins...', time: '5h ago', dur: '0:21', voice: 'Maya', date: 'Yesterday' },
    { text: 'Meditation starts with breathing...', time: '1d ago', dur: '0:45', voice: 'Sahil', date: 'Mar 5' },
  ]

  return (
    <div className="dashboard-page">
      <div className="app-shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <svg viewBox="0 0 100 50" style={{ width: '32px', height: 'auto', color: 'var(--text-primary)' }} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 5 25 L 20 25 C 26 25, 30 10, 35 10 C 38 10, 40 16, 42 22" />
              <path d="M 38 14 L 47 36 C 48.5 40, 51.5 40, 53 36 L 63 14 C 65 8, 69 8, 71 14 C 73 21, 76 25, 82 25 L 95 25" />
            </svg>
            <span className="sidebar-logo-text">VOXAR</span>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-label">Main</div>
            <nav className="sidebar-nav">
              <a className="sidebar-item active" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                <span>Studio</span>
              </a>
              <a className="sidebar-item" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                <span>Text to Speech</span>
              </a>
              <a className="sidebar-item" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                <span>Speech to Text</span>
              </a>
              <a className="sidebar-item" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                <span>Voice Cloning</span>
                <span className="sidebar-badge">NEW</span>
              </a>
              <a className="sidebar-item" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
                <span>Voice Library</span>
                <span className="sidebar-badge">20</span>
              </a>
              <a className="sidebar-item" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span>History</span>
              </a>
              <a className="sidebar-item" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <span>Projects</span>
              </a>
            </nav>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <div className="sidebar-section-label">Tools</div>
            <nav className="sidebar-nav">
              <a className="sidebar-item" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <span>Dubbing</span>
              </a>
              <a className="sidebar-item" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                <span>Transcribe</span>
              </a>
            </nav>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <nav className="sidebar-nav">
              <a className="sidebar-item" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                <span>Settings</span>
              </a>
              <a className="sidebar-item" href="/">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                <span>Logout</span>
              </a>
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-usage">
              <div className="sidebar-usage-label">Usage This Month</div>
              <div className="usage-bar-track"><div className="usage-bar-fill" style={{ width: '34%' }} /></div>
              <div className="usage-text"><strong>34 min</strong> / 120 min</div>
            </div>
          </div>
        </aside>

        {/* Header */}
        <header className="dash-header">
          <div className="header-left">
            <div className="header-breadcrumb">
              <span className="breadcrumb-segment">Studio</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-segment current">Text to Speech</span>
            </div>
            <span className="header-project-tag">● Pro Plan</span>
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
                  <a className="profile-dropdown-item" href="#">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Account
                  </a>
                  <a className="profile-dropdown-item" href="#">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                    Plan
                    <span className="profile-plan-badge">Pro</span>
                  </a>
                  <div className="profile-dropdown-divider" />
                  <a className="profile-dropdown-item profile-dropdown-logout" href="/">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="workspace">
          {/* Editor */}
          <div className="editor-panel">
            <div className="editor-toolbar">
              <div className="toolbar-left">
                <span className="toolbar-title">Text Editor</span>
              </div>
              <div className="toolbar-right">
                <span className="char-count">{wordCount} words · {charCount} / {maxChars}</span>
              </div>
            </div>

            <div className="editor-body">
              <div className="text-editor">
                <textarea
                  className="text-area"
                  placeholder="Start typing or paste your text here... VOXAR will bring your words to life with studio-quality voice synthesis."
                  value={text}
                  onChange={e => { if (e.target.value.length <= maxChars) setText(e.target.value) }}
                />
              </div>
            </div>

            {/* Audio Player — Simple progress line */}
            <div className={`audio-player ${showPlayer ? 'visible' : ''}`}>
              <div className="player-inner">
                <button className="player-btn" onClick={() => { if (playProgress >= 100) setPlayProgress(0); setPlaying(!playing) }}>
                  {playing ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="4" x2="6" y2="20" /><line x1="18" y1="4" x2="18" y2="20" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  )}
                </button>
                <div className="player-progress-track" onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPlayProgress(((e.clientX - rect.left) / rect.width) * 100) }}>
                  <div className="player-progress-fill" style={{ width: `${playProgress}%` }} />
                  <div className="player-progress-dot" style={{ left: `${playProgress}%` }} />
                </div>
                <span className="player-time">{Math.floor(playProgress * 0.14 / 100 * 60).toString().padStart(1, '0')}:{Math.floor((playProgress * 0.14 / 100 * 60 % 1) * 60).toString().padStart(2, '0')} / 0:14</span>
                <div className="player-actions">
                  <button className="player-action-btn" title="Download">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </button>
                  <button className="player-action-btn" title="Share">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                  </button>
                </div>
              </div>
              {/* Export format selector (Item 23) */}
              {exportFormat && (
                <div className="export-formats">
                  <span className="export-label">Export as:</span>
                  <button className={`export-pill ${exportFormat === 'mp3' ? 'active' : ''}`} onClick={() => setExportFormat('mp3')}>MP3 320kbps</button>
                  <button className={`export-pill ${exportFormat === 'wav' ? 'active' : ''}`} onClick={() => setExportFormat('wav')}>WAV Lossless</button>
                </div>
              )}
            </div>

            <div className="editor-footer">
              <div className="footer-left">
                <span className="footer-info"><span className="footer-info-dot" /> Ready</span>
                <span className="footer-info">Engine: {engine}</span>
              </div>
              <div className="footer-right">
                <button className="btn-secondary-action">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                  Clear
                </button>
                <button className="btn-generate" onClick={handleGenerate} disabled={generating || !text.trim()}>
                  {generating ? (
                    <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating...</>
                  ) : (
                    <>Create</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="controls-panel">
            <div className="controls-header">
              <h3 className="controls-title">Voice Controls</h3>
            </div>
            <div className="controls-body">
              {/* Voice Selector */}
              <div className="control-group">
                <div className="control-label">Voice <span className="control-label-hint">TAP TO PREVIEW</span></div>
                <div className="voice-selector">
                  <div className="voice-avatar" />
                  <div className="voice-info">
                    <div className="voice-name">{selectedVoice}</div>
                    <div className="voice-meta">The Narrator • EN, HI</div>
                  </div>
                  <button className="voice-preview-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </button>
                  <svg className="voice-selector-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>

              {/* Engine */}
              <div className="control-group">
                <div className="control-label">Engine</div>
                <select className="model-select" value={engine} onChange={e => setEngine(e.target.value)}>
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
                  <div className="slider-track" ref={stabilityRef} onMouseDown={e => { stabilitySlider.handleStart(e); const rect = stabilityRef.current!.getBoundingClientRect(); const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); setStability(Math.round(pct * 100)) }}>
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
                  <div className="slider-track" ref={speedRef} onMouseDown={e => { speedSlider.handleStart(e); const rect = speedRef.current!.getBoundingClientRect(); const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); setSpeed(Math.round((0.5 + pct * 1.5) * 10) / 10) }}>
                    <div className="slider-fill" style={{ width: `${speedSlider.pct}%` }} />
                    <div className="slider-thumb" style={{ left: `${speedSlider.pct}%` }} onMouseDown={speedSlider.handleStart} onTouchStart={speedSlider.handleStart} />
                  </div>
                </div>
              </div>

              <div className="controls-divider" />

              {/* Language */}
              <div className="control-group">
                <div className="control-label">Language</div>
                <select className="lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="auto">Auto-detect</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="bn">Bengali</option>
                </select>
              </div>

              {/* Format */}
              <div className="control-group">
                <div className="control-label">Output Format</div>
                <div className="format-options">
                  {['mp3', 'wav', 'ogg', 'flac'].map(f => (
                    <button key={f} className={`format-chip ${format === f ? 'active' : ''}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
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
                <div className={`toggle-switch ${enhance ? 'active' : ''}`} onClick={() => setEnhance(!enhance)}>
                  <div className="toggle-knob" />
                </div>
              </div>
              <div className="toggle-control">
                <div className="toggle-info">
                  <span className="toggle-label">Loudness Normalize</span>
                  <span className="toggle-desc">Normalize to -14 LUFS</span>
                </div>
                <div className={`toggle-switch ${normalize ? 'active' : ''}`} onClick={() => setNormalize(!normalize)}>
                  <div className="toggle-knob" />
                </div>
              </div>
            </div>

            {/* History */}
            <div className="history-section">
              <h4 className="history-title">Recent Generations</h4>
              <div className="history-list">
                {historyItems.map((item, i) => (
                  <div key={i} className="history-card">
                    <div className="history-card-top">
                      <div className="history-play">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </div>
                      <div className="history-info">
                        <div className="history-text">{item.text}</div>
                        <div className="history-meta-row">
                          <span className="history-voice-tag">{item.voice}</span>
                          <span className="history-dur">{item.dur}</span>
                          <span className="history-date">{item.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
