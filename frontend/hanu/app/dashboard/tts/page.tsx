'use client'

import { useEffect, useState } from 'react'
import EditorPanel from '@/components/dashboard/EditorPanel'
import ControlsPanel from '@/components/dashboard/ControlsPanel'
import AudioPlayer from '@/components/dashboard/AudioPlayer'
import HistoryList from '@/components/dashboard/HistoryList'
import DashHeader from '@/components/dashboard/DashHeader'
import { useTTSStore } from '@/stores/ttsStore'

export default function TTSPage() {
  const { generateAudio, isGenerating, text, error } = useTTSStore()

  useEffect(() => {
    const saved = localStorage.getItem('voxar-theme')
    if (saved === 'light') document.body.classList.add('light-mode')
  }, [])

  return (
    <>
      <DashHeader
        breadcrumbs={[
          { label: 'Studio', href: '/dashboard/studio' },
          { label: 'Text to Speech' }
        ]}
        planLabel="Pro Plan"
      />
      <div className="workspace">
        <div className="editor-panel">
          <EditorPanel />
          <AudioPlayer />
          {error && (
            <div style={{ padding: '12px 20px', color: '#ef4444', fontSize: '13px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', margin: '8px 20px' }}>
              {error}
            </div>
          )}
          <div className="editor-footer">
            <div className="footer-left">
              <span className="footer-info"><span className="footer-info-dot" /> Ready</span>
              <span className="footer-info">Engine: cinematic</span>
            </div>
            <div className="footer-right">
              <button className="btn-secondary-action" onClick={() => useTTSStore.getState().updateSettings({ text: '', showPlayer: false, audioUrl: null, error: null })}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                Clear
              </button>
              <button
                className={`btn-generate ${isGenerating ? 'loading' : ''}`}
                onClick={() => generateAudio()}
                disabled={isGenerating || !text.trim()}
              >
                {isGenerating ? 'Generating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>

        <div className="controls-panel">
          <div className="controls-header">
            <h3 className="controls-title">Voice Controls</h3>
          </div>
          <ControlsPanel />
          <HistoryList />
        </div>
      </div>
    </>
  )
}
