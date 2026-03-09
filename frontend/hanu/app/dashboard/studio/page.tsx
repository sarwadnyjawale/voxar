'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import DashHeader from '@/components/dashboard/DashHeader'
import { IconPlay, IconPlus, IconCopy, IconCheck } from '@/components/landing/Icons'

interface SpeechBlock {
  id: string
  text: string
  voice: string
  voiceAvatar: string
  duration: number
}

const VOICES = [
  { name: 'Arjun', style: 'The Narrator', avatar: 'av-1', color: 'linear-gradient(135deg,#ff6b6b,#ee5a24)' },
  { name: 'Priya', style: 'The Poet', avatar: 'av-2', color: 'linear-gradient(135deg,#a29bfe,#6c5ce7)' },
  { name: 'Vikram', style: 'The Anchor', avatar: 'av-3', color: 'linear-gradient(135deg,#00cec9,#0984e3)' },
  { name: 'Maya', style: 'The Storyteller', avatar: 'av-4', color: 'linear-gradient(135deg,#fd79a8,#e84393)' },
  { name: 'Kabir', style: 'The Narrator', avatar: 'av-5', color: 'linear-gradient(135deg,#f9ca24,#f0932b)' },
  { name: 'Kavya', style: 'The Guide', avatar: 'av-6', color: 'linear-gradient(135deg,#55efc4,#00b894)' },
]

let blockIdCounter = 0
const makeBlock = (text = '', voiceIdx = 0): SpeechBlock => ({
  id: `blk-${++blockIdCounter}`,
  text,
  voice: VOICES[voiceIdx].name,
  voiceAvatar: VOICES[voiceIdx].avatar,
  duration: Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length * 0.4)),
})

export default function StudioPage() {
  const [projectName, setProjectName] = useState('Untitled Project')
  const [blocks, setBlocks] = useState<SpeechBlock[]>([
    makeBlock('Welcome to VOXAR Studio. This is your advanced workspace for creating multi-voice audio productions.', 0),
    makeBlock('Each block represents a speech segment. You can assign different voices to each block.', 1),
    makeBlock('Use the timeline below to preview your entire project as a seamless audio experience.', 2),
  ])
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playProgress, setPlayProgress] = useState(0)
  const [volume, setVolume] = useState(80)
  const [engine, setEngine] = useState('cinematic')
  const [enhance, setEnhance] = useState(true)

  const volumeRef = useRef<HTMLDivElement>(null)

  // Play simulation
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setPlayProgress(prev => {
        if (prev >= 100) { setIsPlaying(false); return 100 }
        return prev + 0.3
      })
    }, 50)
    return () => clearInterval(interval)
  }, [isPlaying])

  const totalDuration = blocks.reduce((sum, b) => sum + b.duration, 0)

  const updateBlockText = (id: string, text: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, text, duration: Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length * 0.4)) } : b
    ))
  }

  const cycleVoice = (id: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b
      const currentIdx = VOICES.findIndex(v => v.name === b.voice)
      const nextIdx = (currentIdx + 1) % VOICES.length
      return { ...b, voice: VOICES[nextIdx].name, voiceAvatar: VOICES[nextIdx].avatar }
    }))
  }

  const addBlock = () => {
    const newBlock = makeBlock('', 0)
    setBlocks(prev => [...prev, newBlock])
    setActiveBlockId(newBlock.id)
  }

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return
    setBlocks(prev => prev.filter(b => b.id !== id))
    if (activeBlockId === id) setActiveBlockId(null)
  }

  const duplicateBlock = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id)
    if (idx === -1) return
    const original = blocks[idx]
    const voiceIdx = VOICES.findIndex(v => v.name === original.voice)
    const dup = makeBlock(original.text, voiceIdx >= 0 ? voiceIdx : 0)
    setBlocks(prev => [...prev.slice(0, idx + 1), dup, ...prev.slice(idx + 1)])
  }

  const handleVolumeClick = useCallback((e: React.MouseEvent) => {
    if (!volumeRef.current) return
    const rect = volumeRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)))
    setVolume(pct)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const getVoiceColor = (name: string) => VOICES.find(v => v.name === name)?.color || VOICES[0].color

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

            {/* Engine */}
            <div className="studio-left-section">
              <div className="studio-left-section-title">Model</div>
              <div className="control-group">
                <select className="model-select" value={engine} onChange={e => setEngine(e.target.value)}>
                  <option value="flash">Flash — Low Latency</option>
                  <option value="cinematic">Cinematic — Studio Grade</option>
                  <option value="longform">Longform — Audiobooks</option>
                  <option value="multilingual">Multilingual — 12 Languages</option>
                </select>
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
              <button className="btn-secondary-action" style={{ width: '100%', justifyContent: 'center', padding: '9px', fontSize: '12px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                Enhance Text with AI
              </button>
            </div>

            <div className="controls-divider" />

            {/* Output */}
            <div className="studio-left-section">
              <div className="studio-left-section-title">Output Format</div>
              <div className="format-options">
                {['mp3', 'wav', 'flac'].map(f => (
                  <button key={f} className={`format-chip ${f === 'wav' ? 'active' : ''}`}>{f.toUpperCase()}</button>
                ))}
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
              <span className="studio-project-status">
                <span className="studio-project-dot" />
                Saved
              </span>
            </div>
            <div className="studio-toolbar-right">
              <span className="char-count">{blocks.length} blocks · {totalDuration}s total</span>
              <button className="btn-generate" style={{ padding: '8px 20px', fontSize: '12px' }}>
                Generate All
              </button>
            </div>
          </div>

          {/* Script Blocks */}
          <div className="studio-blocks">
            {blocks.map((block, i) => (
              <div
                key={block.id}
                className={`studio-block ${activeBlockId === block.id ? 'active' : ''}`}
                onClick={() => setActiveBlockId(block.id)}
              >
                <div className="studio-block-voice">
                  <div
                    className="studio-block-avatar"
                    style={{ background: getVoiceColor(block.voice) }}
                    onClick={(e) => { e.stopPropagation(); cycleVoice(block.id) }}
                    title="Click to change voice"
                  >
                    {block.voice[0]}
                  </div>
                  <span className="studio-block-voice-name">{block.voice}</span>
                </div>
                <div className="studio-block-content">
                  <textarea
                    className="studio-block-text"
                    value={block.text}
                    onChange={e => updateBlockText(block.id, e.target.value)}
                    placeholder="Type your text here..."
                    rows={Math.max(1, Math.ceil(block.text.length / 80))}
                  />
                </div>
                <div className="studio-block-actions">
                  <button className="studio-block-btn" title="Play block">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </button>
                  <button className="studio-block-btn" title="Regenerate">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                  </button>
                  <button className="studio-block-btn" title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id) }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  </button>
                  <button className="studio-block-btn studio-block-btn--danger" title="Delete" onClick={(e) => { e.stopPropagation(); deleteBlock(block.id) }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              </div>
            ))}

            <button className="studio-add-block" onClick={addBlock}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Speech Block
            </button>
          </div>

          {/* Timeline */}
          <div className="studio-timeline">
            <div className="studio-timeline-controls">
              <button
                className="studio-timeline-play"
                onClick={() => { if (playProgress >= 100) setPlayProgress(0); setIsPlaying(!isPlaying) }}
              >
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="6" y1="4" x2="6" y2="20" /><line x1="18" y1="4" x2="18" y2="20" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                )}
              </button>
              <div className="studio-timeline-track">
                <div className="studio-timeline-segments">
                  {blocks.map((block, i) => (
                    <div
                      key={block.id}
                      className={`studio-timeline-seg ${activeBlockId === block.id ? 'active' : ''}`}
                      style={{ flex: block.duration }}
                      onClick={() => setActiveBlockId(block.id)}
                    >
                      {block.voice}
                    </div>
                  ))}
                </div>
                <div className="studio-timeline-progress" onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setPlayProgress(((e.clientX - rect.left) / rect.width) * 100) }}>
                  <div className="studio-timeline-progress-fill" style={{ width: `${playProgress}%` }} />
                </div>
              </div>
              <span className="studio-timeline-time">
                {formatTime(Math.floor(playProgress / 100 * totalDuration))} / {formatTime(totalDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
