'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import DashHeader from '@/components/dashboard/DashHeader'
import { IconCopy, IconMic, IconCheck } from '@/components/landing/Icons'
import { useVoiceStore, ClonedVoice } from '@/stores/voiceStore'
import { api } from '@/lib/api'

const ALLOWED_TYPES = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/ogg', 'audio/x-m4a', 'audio/webm', 'audio/x-wav']
const MAX_FILES = 3
const MIN_FILE_SIZE = 5 * 1024       // 5KB minimum
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB maximum

export default function CloningPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [cloneName, setCloneName] = useState('')
  const [cloneLanguage, setCloneLanguage] = useState('en')
  const [files, setFiles] = useState<File[]>([])
  const [isCloning, setIsCloning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cloneResult, setCloneResult] = useState<{ name: string; quality?: number } | null>(null)

  // Consent
  const [consentOwn, setConsentOwn] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)

  // Mic recording
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cloned voices from store
  const { clonedVoices, fetchClonedVoices } = useVoiceStore()

  useEffect(() => {
    fetchClonedVoices()
  }, [fetchClonedVoices])

  // File validation
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(wav|mp3|flac|ogg|m4a|webm)$/i)) {
      return `"${file.name}" — unsupported format. Use WAV, MP3, FLAC, OGG, M4A, or WebM.`
    }
    if (file.size < MIN_FILE_SIZE) {
      return `"${file.name}" — file too small (${(file.size / 1024).toFixed(1)}KB). Minimum 5KB.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" — file too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum 25MB.`
    }
    return null
  }

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    const totalAfter = files.length + arr.length
    if (totalAfter > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} audio files allowed. You have ${files.length}, tried to add ${arr.length}.`)
      return
    }
    for (const f of arr) {
      const err = validateFile(f)
      if (err) { setError(err); return }
    }
    setError(null)
    setFiles(prev => [...prev, ...arr])
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
    setError(null)
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [files])

  // Mic recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setRecordedBlob(null)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch {
      setError('Microphone access denied. Please allow microphone access in your browser settings.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const useRecording = () => {
    if (!recordedBlob) return
    if (recordingTime < 3) {
      setError('Recording too short. Please record at least 3 seconds of speech.')
      return
    }
    const file = new File([recordedBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' })
    if (files.length >= MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files. Remove one before adding recording.`)
      return
    }
    setFiles(prev => [...prev, file])
    setRecordedBlob(null)
    setRecordingTime(0)
    setError(null)
  }

  const discardRecording = () => {
    setRecordedBlob(null)
    setRecordingTime(0)
  }

  const formatRecordTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  // Clone submission
  const canStartClone = cloneName.trim() && files.length >= 1 && consentOwn && consentTerms

  const startClone = async () => {
    if (!canStartClone) return
    setIsCloning(true)
    setStep(2)
    setProgress(0)
    setError(null)

    // Use only the first file for the API (backend accepts single file via multer)
    const formData = new FormData()
    formData.append('sample', files[0])
    formData.append('name', cloneName.trim())
    formData.append('language', cloneLanguage)

    // Fake progress while waiting for API
    const progressInterval = setInterval(() => {
      setProgress(prev => prev >= 90 ? 90 : prev + 1)
    }, 200)

    try {
      const result = await api.backendUpload<{ voice: { name: string; quality_score: number; status: string } }>(
        '/api/v1/voices/clone',
        formData
      )

      clearInterval(progressInterval)
      setProgress(100)
      setCloneResult({
        name: result.voice.name,
        quality: result.voice.quality_score,
      })

      // Refresh cloned voices list
      fetchClonedVoices()

      setTimeout(() => {
        setIsCloning(false)
        setStep(3)
      }, 500)
    } catch (err: any) {
      clearInterval(progressInterval)
      setIsCloning(false)
      setStep(1)
      setError(err.message || 'Voice cloning failed. Please try again with a cleaner audio sample.')
    }
  }

  const resetForm = () => {
    setStep(1)
    setCloneName('')
    setCloneLanguage('en')
    setFiles([])
    setProgress(0)
    setIsCloning(false)
    setError(null)
    setCloneResult(null)
    setConsentOwn(false)
    setConsentTerms(false)
    setRecordedBlob(null)
    setRecordingTime(0)
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
                Create a digital replica of any voice. Upload 1-3 clean audio samples or record directly. We{"'"}ll generate speech in that voice across all languages.
              </p>
            </div>
          </div>
        </div>

        <div className="dp-two-col">
          {/* Left: Clone Wizard */}
          <div className="glass-card" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
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

            {/* Step 1: Upload / Record */}
            {step === 1 && (
              <div>
                <div className="dp-form-group">
                  <label className="dp-form-label">Voice Name</label>
                  <input
                    type="text"
                    className="dp-input"
                    placeholder="e.g., My Podcast Voice"
                    value={cloneName}
                    onChange={e => setCloneName(e.target.value)}
                    maxLength={50}
                  />
                </div>

                <div className="dp-form-group">
                  <label className="dp-form-label">Language</label>
                  <select
                    className="model-select"
                    value={cloneLanguage}
                    onChange={e => setCloneLanguage(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="bn">Bengali</option>
                    <option value="mr">Marathi</option>
                  </select>
                </div>

                {/* File Upload */}
                <div className="dp-form-group">
                  <label className="dp-form-label">Audio Samples ({files.length}/{MAX_FILES})</label>
                  <div
                    className={`dp-drop-zone ${files.length > 0 ? 'has-file' : ''} ${dragging ? 'dragging' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                  >
                    <input
                      type="file"
                      id="clone-upload"
                      style={{ display: 'none' }}
                      accept="audio/*"
                      multiple
                      onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }}
                    />
                    <label htmlFor="clone-upload" style={{ cursor: 'pointer', display: 'block' }}>
                      <div className="dp-drop-icon">
                        <IconMic size={24} />
                      </div>
                      <div className="dp-drop-title">Click to upload or drag & drop</div>
                      <div className="dp-drop-hint">WAV, MP3, FLAC — min 3s, max 25MB per file — up to 3 files</div>
                    </label>
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {files.map((f, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 10px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {f.name}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-dim)', flexShrink: 0 }}>
                              {(f.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          <button
                            onClick={() => removeFile(i)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mic Recording */}
                <div className="dp-form-group">
                  <label className="dp-form-label">Or Record Live</label>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                  }}>
                    {!isRecording && !recordedBlob && (
                      <button
                        className="btn-generate"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                        onClick={startRecording}
                        disabled={files.length >= MAX_FILES}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                        Start Recording
                      </button>
                    )}
                    {isRecording && (
                      <>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', minWidth: '40px' }}>
                          {formatRecordTime(recordingTime)}
                        </span>
                        <button
                          className="btn-generate"
                          style={{ padding: '8px 16px', fontSize: '12px', marginLeft: 'auto' }}
                          onClick={stopRecording}
                        >
                          Stop
                        </button>
                      </>
                    )}
                    {recordedBlob && !isRecording && (
                      <>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Recorded {formatRecordTime(recordingTime)}
                        </span>
                        <button
                          className="btn-generate"
                          style={{ padding: '6px 14px', fontSize: '11px', marginLeft: 'auto' }}
                          onClick={useRecording}
                        >
                          Use
                        </button>
                        <button
                          className="btn-secondary-action"
                          style={{ padding: '6px 14px', fontSize: '11px' }}
                          onClick={discardRecording}
                        >
                          Discard
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Consent */}
                <div className="dp-form-group" style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={consentOwn}
                        onChange={e => setConsentOwn(e.target.checked)}
                        style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
                      />
                      I confirm this is my own voice or I have explicit written permission from the voice owner to create this clone.
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={consentTerms}
                        onChange={e => setConsentTerms(e.target.checked)}
                        style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
                      />
                      I agree to VOXAR{"'"}s voice cloning terms of use and understand cloned voices must not be used for impersonation, fraud, or deception.
                    </label>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    fontSize: '12px', color: '#ef4444', marginTop: '8px',
                  }}>
                    {error}
                  </div>
                )}

                <button
                  className="btn-generate"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '16px' }}
                  disabled={!canStartClone}
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
                  Analyzing audio characteristics for &quot;{cloneName}&quot;...
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
                  &quot;{cloneResult?.name || cloneName}&quot; has been added to your voice library
                  {cloneResult?.quality ? ` with a quality score of ${cloneResult.quality}/100` : ''}.
                </p>
                <div className="dp-success-actions">
                  <a href="/dashboard/voices" className="btn-secondary-action">View Library</a>
                  <a href="/dashboard/tts" className="btn-generate">Use Voice Now</a>
                </div>
                <button
                  className="btn-secondary-action"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                  onClick={resetForm}
                >
                  Create Another Clone
                </button>
              </div>
            )}
          </div>

          {/* Right: Existing Clones */}
          <div>
            <div className="dp-section-title">Your Clones</div>
            {clonedVoices.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div className="dp-empty-icon" style={{ margin: '0 auto 12px' }}>
                  <IconCopy size={24} />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>No clones yet. Create your first voice clone.</p>
              </div>
            ) : (
              <div className="dp-clone-list">
                {clonedVoices.map((clone: ClonedVoice) => (
                  <div key={clone._id} className="dp-clone-item">
                    <div className="dp-clone-avatar">
                      {clone.name[0]}
                    </div>
                    <div className="dp-clone-info">
                      <div className="dp-clone-name">{clone.name}</div>
                      <div className="dp-clone-meta">
                        {clone.quality_score > 0 ? `Score: ${clone.quality_score}/100 · ` : ''}
                        {new Date(clone.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`dp-type-badge dp-type-badge--clone`}>{clone.status}</span>
                  </div>
                ))}
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
                <li>Upload multiple samples for better accuracy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
