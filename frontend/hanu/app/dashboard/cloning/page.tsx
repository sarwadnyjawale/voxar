'use client'

import { useState, useCallback } from 'react'
import DashHeader from '@/components/dashboard/DashHeader'
import { IconCopy, IconMic, IconCheck } from '@/components/landing/Icons'

interface CloneVoice {
  id: string
  name: string
  createdAt: string
  status: 'ready' | 'training'
}

const mockClones: CloneVoice[] = [
  { id: 'c1', name: "John's Podcast Voice", createdAt: 'Mar 5, 2026', status: 'ready' },
  { id: 'c2', name: 'Brand Narrator', createdAt: 'Mar 3, 2026', status: 'ready' },
]

export default function CloningPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [cloneName, setCloneName] = useState('')
  const [cloneFile, setCloneFile] = useState<File | null>(null)
  const [isCloning, setIsCloning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCloneFile(e.dataTransfer.files[0])
    }
  }, [])

  const startClone = () => {
    setIsCloning(true)
    setStep(2)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsCloning(false)
          setStep(3)
          return 100
        }
        return prev + 2
      })
    }, 60)
  }

  const resetForm = () => {
    setStep(1)
    setCloneName('')
    setCloneFile(null)
    setProgress(0)
    setIsCloning(false)
  }

  return (
    <>
      <DashHeader breadcrumbs={[{ label: 'Studio' }, { label: 'Voice Cloning' }]} />

      <div className="dp-scroll">
        <div className="dp-header">
          <div className="dp-header-row">
            <div>
              <h2 className="dp-title">Voice Cloning</h2>
              <p className="dp-subtitle">
                Create a digital replica of any voice. Upload a clean 30-second sample and generate speech in that voice across all languages.
              </p>
            </div>
          </div>
        </div>

        <div className="dp-two-col">
          {/* Left: Clone Wizard */}
          <div className="glass-card">
            {/* Step Indicator */}
            <div className="dp-steps">
              <div className="dp-step">
                <div className={`dp-step-dot ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
                  {step > 1 ? <IconCheck size={14} /> : '1'}
                </div>
              </div>
              <div className={`dp-step-line ${step > 1 ? 'done' : ''}`} />
              <div className="dp-step">
                <div className={`dp-step-dot ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
                  {step > 2 ? <IconCheck size={14} /> : '2'}
                </div>
              </div>
              <div className={`dp-step-line ${step > 2 ? 'done' : ''}`} />
              <div className="dp-step">
                <div className={`dp-step-dot ${step === 3 ? 'active' : ''}`}>3</div>
              </div>
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
              <div>
                <div className="dp-form-group">
                  <label className="dp-form-label">Voice Name</label>
                  <input
                    type="text"
                    className="dp-input"
                    placeholder="e.g., John's Podcast Voice"
                    value={cloneName}
                    onChange={e => setCloneName(e.target.value)}
                  />
                </div>

                <div className="dp-form-group">
                  <label className="dp-form-label">Audio Sample</label>
                  <div
                    className={`dp-drop-zone ${cloneFile ? 'has-file' : ''} ${dragging ? 'dragging' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                  >
                    <input
                      type="file"
                      id="clone-upload"
                      style={{ display: 'none' }}
                      accept="audio/*"
                      onChange={e => e.target.files && setCloneFile(e.target.files[0])}
                    />
                    <label htmlFor="clone-upload" style={{ cursor: 'pointer', display: 'block' }}>
                      <div className="dp-drop-icon">
                        <IconMic size={24} />
                      </div>
                      {cloneFile ? (
                        <>
                          <div className="dp-drop-file-name">{cloneFile.name}</div>
                          <div className="dp-drop-file-size">{(cloneFile.size / 1024 / 1024).toFixed(2)} MB</div>
                        </>
                      ) : (
                        <>
                          <div className="dp-drop-title">Click to upload or drag & drop</div>
                          <div className="dp-drop-hint">WAV or MP3, max 30 seconds, clean audio only</div>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  className="btn-generate"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
                  disabled={!cloneName || !cloneFile}
                  onClick={startClone}
                >
                  <IconCopy size={16} />
                  Start Cloning
                </button>
              </div>
            )}

            {/* Step 2: Processing */}
            {step === 2 && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div className="dp-drop-icon" style={{ margin: '0 auto 20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'dashSpin 2s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Training Voice Model
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Analyzing audio characteristics for "{cloneName}"...
                </p>
                <div className="dp-progress">
                  <div className="dp-progress-header">
                    <span className="dp-progress-label">Processing</span>
                    <span className="dp-progress-pct">{progress}%</span>
                  </div>
                  <div className="dp-progress-track">
                    <div className="dp-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div>
                <div className="dp-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="dp-success-title">Clone Created Successfully</h3>
                <p className="dp-success-desc">
                  "{cloneName}" has been added to your voice library and is ready for generation.
                </p>
                <div className="dp-success-actions">
                  <a href="/dashboard/voices" className="btn-secondary-action">View Library</a>
                  <a href="/dashboard" className="btn-generate">Use Voice Now</a>
                </div>
              </div>
            )}
          </div>

          {/* Right: Existing Clones */}
          <div>
            <div className="dp-section-title">Your Clones</div>
            {mockClones.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div className="dp-empty-icon" style={{ margin: '0 auto 12px' }}>
                  <IconCopy size={24} />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>No clones yet. Create your first voice clone.</p>
              </div>
            ) : (
              <div className="dp-clone-list">
                {mockClones.map(clone => (
                  <div key={clone.id} className="dp-clone-item">
                    <div className="dp-clone-avatar">
                      {clone.name[0]}
                    </div>
                    <div className="dp-clone-info">
                      <div className="dp-clone-name">{clone.name}</div>
                      <div className="dp-clone-meta">Created {clone.createdAt}</div>
                    </div>
                    <span className="dp-type-badge dp-type-badge--clone">{clone.status}</span>
                  </div>
                ))}
                <button
                  className="btn-secondary-action"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                  onClick={resetForm}
                >
                  Create Another Clone
                </button>
              </div>
            )}

            {/* Tips Card */}
            <div className="glass-card glass-card--no-hover glass-card--sm" style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Tips for best results</div>
              <ul style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
                <li>Use clean audio without background noise</li>
                <li>Record 20-30 seconds of natural speech</li>
                <li>Avoid music or sound effects</li>
                <li>Speak in a consistent tone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
