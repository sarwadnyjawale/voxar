'use client'

import { useCallback, useState } from 'react'
import { useSTTStore } from '@/stores/sttStore'
import DashHeader from '@/components/dashboard/DashHeader'
import { IconFileText, IconCopy, IconCheck, IconDownload } from '@/components/landing/Icons'

export default function TranscribePage() {
  const { file, isUploading, isTranscribing, progress, result, startTranscription, setFile, reset } = useSTTStore()
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [exportFormat, setExportFormat] = useState('txt')

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }, [setFile])

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const speakerClass = (speaker: string) => {
    if (speaker.includes('00')) return 'dp-segment-speaker dp-segment-speaker--0'
    if (speaker.includes('01')) return 'dp-segment-speaker dp-segment-speaker--1'
    return 'dp-segment-speaker dp-segment-speaker--2'
  }

  return (
    <>
      <DashHeader
        breadcrumbs={[
          { label: 'Studio' },
          { label: 'Transcription (STT)' }
        ]}
      />
      <div className="workspace">
        {/* Left Panel: Results */}
        <div className="editor-panel">
          <div className="editor-toolbar">
            <span className="toolbar-title">Transcription Output</span>
            {result && (
              <div className="toolbar-right">
                <button className="btn-secondary-action" onClick={handleCopy} style={{ padding: '7px 14px', fontSize: '12px' }}>
                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              </div>
            )}
          </div>
          <div className="editor-body" style={{ padding: '24px', overflowY: 'auto' }}>
            {result ? (
              <div>
                {result.segments.map((seg, i) => (
                  <div key={i} className="dp-segment">
                    <div className="dp-segment-meta">
                      <span className={speakerClass(seg.speaker || 'SPEAKER_00')}>
                        {(seg.speaker || 'SPEAKER_00').replace('SPEAKER_', 'Speaker ')}
                      </span>
                      <span className="dp-segment-time">
                        {seg.start.toFixed(1)}s — {seg.end.toFixed(1)}s
                      </span>
                    </div>
                    <p className="dp-segment-text">{seg.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dp-empty">
                <div className="dp-empty-icon">
                  <IconFileText size={28} />
                </div>
                <h3 className="dp-empty-title">No transcription yet</h3>
                <p className="dp-empty-desc">
                  Upload an audio or video file to generate a precise transcription with speaker diarization.
                </p>
              </div>
            )}
          </div>
          {result && (
            <div className="editor-footer">
              <div className="footer-left">
                <span className="footer-info">
                  <span className="footer-info-dot" /> Complete
                </span>
                <span className="footer-info">{result.segments.length} segments</span>
                <span className="footer-info">Lang: {result.language.toUpperCase()}</span>
              </div>
              <div className="footer-right">
                <div className="export-formats">
                  <span className="export-label">Export</span>
                  {['TXT', 'SRT', 'VTT', 'JSON'].map(fmt => (
                    <button
                      key={fmt}
                      className={`export-pill ${exportFormat === fmt.toLowerCase() ? 'active' : ''}`}
                      onClick={() => setExportFormat(fmt.toLowerCase())}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                <button className="btn-generate" style={{ marginLeft: '12px', padding: '8px 20px', fontSize: '12px' }}>
                  <IconDownload size={14} />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Controls */}
        <div className="controls-panel">
          <div className="controls-header">
            <h3 className="controls-title">Upload Media</h3>
          </div>
          <div className="controls-body">
            {/* Drop Zone */}
            <div
              className={`dp-drop-zone ${file ? 'has-file' : ''} ${dragging ? 'dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
            >
              <input
                type="file"
                id="stt-upload"
                style={{ display: 'none' }}
                accept="audio/*,video/*"
                onChange={e => e.target.files && setFile(e.target.files[0])}
              />
              <label htmlFor="stt-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <div className="dp-drop-icon">
                  <IconFileText size={24} />
                </div>
                {file ? (
                  <>
                    <div className="dp-drop-file-name">{file.name}</div>
                    <div className="dp-drop-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </>
                ) : (
                  <>
                    <div className="dp-drop-title">Drag & drop or click to upload</div>
                    <div className="dp-drop-hint">MP3, WAV, MP4, M4A up to 500MB</div>
                  </>
                )}
              </label>
            </div>

            {/* Language Select */}
            <div className="control-group">
              <div className="control-label">Source Language</div>
              <select className="lang-select">
                <option value="auto">Auto-detect</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="bn">Bengali</option>
                <option value="mr">Marathi</option>
                <option value="kn">Kannada</option>
                <option value="ml">Malayalam</option>
              </select>
            </div>

            {/* Speaker Diarization Toggle */}
            <div className="toggle-control">
              <div className="toggle-info">
                <span className="toggle-label">Speaker Diarization</span>
                <span className="toggle-desc">Identify distinct speakers</span>
              </div>
              <div className="toggle-switch active">
                <div className="toggle-knob" />
              </div>
            </div>

            {/* Word Timestamps Toggle */}
            <div className="toggle-control">
              <div className="toggle-info">
                <span className="toggle-label">Word Timestamps</span>
                <span className="toggle-desc">Word-level timing data</span>
              </div>
              <div className="toggle-switch active">
                <div className="toggle-knob" />
              </div>
            </div>

            <div className="controls-divider" />

            {/* Progress / Action */}
            {(isUploading || isTranscribing) ? (
              <div className="dp-progress">
                <div className="dp-progress-header">
                  <span className="dp-progress-label">
                    {isUploading ? 'Uploading...' : 'Transcribing...'}
                  </span>
                  <span className="dp-progress-pct">{progress}%</span>
                </div>
                <div className="dp-progress-track">
                  <div className="dp-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <button
                className="btn-generate"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!file}
                onClick={() => file && startTranscription()}
              >
                Start Transcription
              </button>
            )}

            {result && (
              <button
                className="btn-secondary-action"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={reset}
              >
                New Transcription
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
