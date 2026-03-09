'use client'

import { useState, useEffect, useRef } from 'react'
import { useTTSStore } from '@/stores/ttsStore'
import { IconDownload } from '@/components/landing/Icons'

export default function AudioPlayer() {
  const { showPlayer, audioUrl, duration } = useTTSStore()
  const [playing, setPlaying] = useState(false)
  const [playProgress, setPlayProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState('0:00')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Create/update audio element when URL changes
  useEffect(() => {
    if (!audioUrl) return
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => {
      if (audio.duration && isFinite(audio.duration)) {
        setPlayProgress((audio.currentTime / audio.duration) * 100)
        const m = Math.floor(audio.currentTime / 60)
        const s = Math.floor(audio.currentTime % 60)
        setCurrentTime(`${m}:${s.toString().padStart(2, '0')}`)
      }
    })
    audio.addEventListener('ended', () => {
      setPlaying(false)
      setPlayProgress(100)
    })
    audio.addEventListener('error', () => {
      setPlaying(false)
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [audioUrl])

  // Reset when showPlayer becomes true
  useEffect(() => {
    if (showPlayer) {
      setPlayProgress(0)
      setPlaying(false)
      setCurrentTime('0:00')
    }
  }, [showPlayer])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      if (playProgress >= 100) {
        audio.currentTime = 0
        setPlayProgress(0)
      }
      audio.play().catch(() => setPlaying(false))
      setPlaying(true)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audio.currentTime = pct * audio.duration
    setPlayProgress(pct * 100)
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `voxar-audio.${audioUrl.split('.').pop() || 'wav'}`
    a.click()
  }

  return (
    <div className={`audio-player ${showPlayer ? 'visible' : ''}`}>
      <div className="player-inner">
        <button className="player-btn" onClick={togglePlay}>
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="4" x2="6" y2="20" /><line x1="18" y1="4" x2="18" y2="20" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          )}
        </button>
        <div className="player-progress-track" onClick={handleSeek}>
          <div className="player-progress-fill" style={{ width: `${playProgress}%` }} />
          <div className="player-progress-dot" style={{ left: `${playProgress}%` }} />
        </div>
        <span className="player-time">{currentTime} / {duration || '0:00'}</span>
        <div className="player-actions">
          <button className="player-action-btn" title="Download" onClick={handleDownload}>
            <IconDownload size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
