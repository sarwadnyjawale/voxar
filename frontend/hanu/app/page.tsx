'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import dynamic from 'next/dynamic'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import PricingCards from '@/components/landing/PricingCards'

const VoiceGallery = dynamic(() => import('@/components/landing/VoiceGallery'), { ssr: false })
import {
  IconZap, IconPlay, IconCheck, IconArrowRight, IconStar, IconMic, IconCopy,
  IconFileText, IconUsers, IconGlobe, IconSubtitles, IconCpu, IconLanguages,
  IconSliders, IconPlus, IconFilm, IconPodcast, IconPenTool, IconBookOpen,
  IconRepeat, IconTheater, IconStore, IconScanFace, IconSettings, IconPencil,
  IconDownload
} from '@/components/landing/Icons'

gsap.registerPlugin(ScrollTrigger)

// ===== DATA =====
const marqueeItems1 = ['Text-to-Speech', 'Voice Cloning', 'Transcription', '12 Languages', 'Speaker Diarization', 'Subtitle Generation', 'Hinglish Detection', 'Studio Mastering']
const marqueeItems2 = ['YouTube', 'Podcasts', 'Audiobooks', 'E-Learning', 'Reels & Shorts', 'Marketing', 'News Channels', 'Video Dubbing', 'Accessibility']

const voices = [
  { num: '01', name: 'Arjun', style: 'The Narrator', lang: 'EN, HI', tags: ['Cinematic', 'Documentary'], av: 'av-1' },
  { num: '02', name: 'Priya', style: 'The Poet', lang: 'HI, EN', tags: ['Poetry', 'Meditation'], av: 'av-2' },
  { num: '03', name: 'Vikram', style: 'The Anchor', lang: 'EN', tags: ['News', 'Professional'], av: 'av-3' },
  { num: '04', name: 'Maya', style: 'The Storyteller', lang: 'EN, HI', tags: ['Storytelling', 'Calm'], av: 'av-4' },
  { num: '05', name: 'Kabir', style: 'The Storyteller', lang: 'EN, HI', tags: ['Cinematic', 'Drama'], av: 'av-5' },
  { num: '06', name: 'Kavya', style: 'The Guide', lang: 'HI, EN', tags: ['Educational', 'Guide'], av: 'av-6' },
  { num: '07', name: 'Aisha', style: 'The Anchor', lang: 'EN, HI', tags: ['News', 'Narration'], av: 'av-1' },
  { num: '08', name: 'Sahil', style: 'The Calm', lang: 'HI, EN', tags: ['Meditation', 'ASMR'], av: 'av-3' },
  { num: '09', name: 'Sophia', style: 'The Narrator', lang: 'EN', tags: ['Audiobooks', 'Narration'], av: 'av-2' },
  { num: '10', name: 'Rohan', style: 'The Presenter', lang: 'EN, HI', tags: ['Professional', 'Clear'], av: 'av-5' },
  { num: '11', name: 'Divya', style: 'The Teacher', lang: 'EN, HI', tags: ['Educational', 'Clear'], av: 'av-4' },
  { num: '12', name: 'Dev', style: 'The Professional', lang: 'EN', tags: ['Corporate', 'Clean'], av: 'av-6' },
  { num: '13', name: 'Isha', style: 'The Creator', lang: 'HI, EN', tags: ['YouTube', 'Reels'], av: 'av-1' },
  { num: '14', name: 'Raj', style: 'The Mentor', lang: 'EN, HI', tags: ['Coaching', 'Warm'], av: 'av-3' },
  { num: '15', name: 'Naina', style: 'The Dreamer', lang: 'HI', tags: ['Soft', 'Storytelling'], av: 'av-2' },
  { num: '16', name: 'Omkar', style: 'The Bold', lang: 'EN, HI', tags: ['Drama', 'Cinematic'], av: 'av-5' },
  { num: '17', name: 'Shreya', style: 'The Reciter', lang: 'HI', tags: ['Poetry', 'Devotional'], av: 'av-4' },
  { num: '18', name: 'Nikhil', style: 'The Anchor', lang: 'EN, HI', tags: ['News', 'Podcast'], av: 'av-6' },
  { num: '19', name: 'Ananya', style: 'The Host', lang: 'EN, HI', tags: ['Events', 'Lively'], av: 'av-1' },
  { num: '20', name: 'Tejas', style: 'The Energetic', lang: 'EN', tags: ['Marketing', 'Ads'], av: 'av-3' },
]

const engines = [
  { num: '01', title: 'VXR-Core', desc: 'The synthesis brain. Text goes in, studio-grade speech comes out. Powers all four generation modes with sub-second latency.', icon: <IconCpu size={20} /> },
  { num: '02', title: 'VXR-Native', desc: 'Regional language pipeline handling 12 languages with native pronunciation — authentic intonation, not robotic transliteration.', icon: <IconGlobe size={20} /> },
  { num: '03', title: 'VXR-Replica', desc: 'Voice cloning engine. Upload a 30-second sample, get a digital twin. Generate speech in that voice across all 12 languages.', icon: <IconCopy size={20} /> },
  { num: '04', title: 'VXR-Scribe', desc: 'Transcription engine. Audio goes in, text comes out. Includes speaker diarization, word-level timestamps, and subtitle export.', icon: <IconFileText size={20} /> },
  { num: '05', title: 'VXR-Omnix', desc: 'Language intelligence layer. Auto-detects Hinglish, converts Romanized text, handles numbers, currency, abbreviations, dates, and pauses.', icon: <IconLanguages size={20} /> },
  { num: '06', title: 'VXR-Master', desc: '8-step studio mastering pipeline. Denoise, normalize, compress, EQ, breath smooth, artifact removal. Quality grades A through F.', icon: <IconSliders size={20} /> },
]

const testimonials = [
  { quote: 'Cut voiceover time by 80%. Hindi pronunciation is the best I\'ve seen from any AI platform — and I\'ve tested them all.', name: 'Rahul Mehta', role: 'YouTube Creator · 120K subscribers', avatar: 'av-1', gradient: 'linear-gradient(135deg,#ff6b6b,#ee5a24)' },
  { quote: 'Transcription quality is incredible. Speaker diarization works perfectly for our multi-host podcast. Saved us hours of manual work every week.', name: 'Sneha Patel', role: 'Podcast Producer', avatar: 'av-2', gradient: 'linear-gradient(135deg,#a29bfe,#6c5ce7)' },
  { quote: '8 Indian languages, one platform. Voice cloning saved us from hiring 8 separate voice artists. The ROI was immediate.', name: 'Amit Verma', role: 'CEO · EdTech Company', avatar: 'av-3', gradient: 'linear-gradient(135deg,#00cec9,#0984e3)' },
  { quote: 'Production-ready audio in seconds. Consistently studio-grade. Our entire agency runs on VOXAR now — 40+ projects a month.', name: 'Priya Krishnan', role: 'Director · Marketing Agency', avatar: 'av-4', gradient: 'linear-gradient(135deg,#fd79a8,#e84393)' },
]

const faqItems = [
  { q: 'Is the free plan really free forever?', a: 'Yes. You get 3 minutes of TTS generation for life. No credit card required. No trial expiry. When you\'re ready to scale, upgrade instantly — your work is always saved.' },
  { q: 'Can I change plans anytime?', a: 'Absolutely. Upgrade or downgrade at any time. Upgrades are prorated — you only pay the difference. No lock-in contracts. No hidden fees.' },
  { q: 'Is audio quality different between plans?', a: 'No. Every plan gets identical studio-grade audio quality — same neural models, same mastering pipeline, same output formats. Plans only differ in usage limits.' },
  { q: 'What happens when I hit my limit?', a: 'You\'ll see a usage notification. You can upgrade instantly to continue — no data is lost, no work is deleted. Your projects and voice clones are always preserved.' },
  { q: 'Why is API access only on Pro?', a: 'API access requires dedicated infrastructure to guarantee uptime and throughput for automated workflows. Pro and Enterprise plans include the infrastructure guarantees needed for production API usage.' },
  { q: 'What payment methods do you support?', a: 'We support all major payment methods via Razorpay — UPI, credit/debit cards, net banking, and digital wallets. All transactions are secured with bank-grade encryption.' },
]

const comingCards = [
  { title: 'AI Video Dubbing', badge: 'Coming Soon', icon: <IconFilm size={20} /> },
  { title: 'AI Podcast Generator', badge: 'Coming Soon', icon: <IconPodcast size={20} /> },
  { title: 'AI Script Writer', badge: 'Coming Soon', icon: <IconPenTool size={20} /> },
  { title: 'AI Audiobook Creator', badge: 'Coming Soon', icon: <IconBookOpen size={20} /> },
  { title: 'Content Repurposer', badge: 'Coming Soon', icon: <IconRepeat size={20} /> },
  { title: 'Real-time Voice Changer', badge: 'Coming Soon', icon: <IconTheater size={20} /> },
  { title: 'Voice Marketplace', badge: 'Coming Soon', icon: <IconStore size={20} /> },
  { title: 'AI Lip Sync', badge: 'Coming Soon', icon: <IconScanFace size={20} /> },
]

// ===== COMPONENT =====
export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [demoText, setDemoText] = useState('Welcome to VOXAR. Experience studio-grade voice synthesis in seconds.')
  const [demoVoice, setDemoVoice] = useState('Arjun')
  const [demoPlaying, setDemoPlaying] = useState(false)
  const [demoProgress, setDemoProgress] = useState(0)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoAudioUrl, setDemoAudioUrl] = useState<string | null>(null)
  const demoAudioRef = useRef<HTMLAudioElement | null>(null)
  const [previewVoice, setPreviewVoice] = useState<number | null>(null)
  const [voiceProgress, setVoiceProgress] = useState(0)
  const [voicePreviews, setVoicePreviews] = useState<Record<string, string>>({})
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  const cubeSceneRef = useRef<HTMLDivElement>(null)
  const cubesRef = useRef<HTMLDivElement[]>([])

  // Initialize cube grid
  useEffect(() => {
    const scene = cubeSceneRef.current
    if (!scene) return
    const cubeSize = 75

    const buildGrid = () => {
      scene.innerHTML = ''
      cubesRef.current = []
      const w = window.innerWidth
      const h = window.innerHeight
      const cols = Math.ceil(w / cubeSize)
      const rows = Math.ceil(h / cubeSize)

      scene.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
      scene.style.gridTemplateRows = `repeat(${rows}, 1fr)`

      const cellW = w / cols
      const cellH = h / rows
      const half = Math.min(cellW, cellH) / 2

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cube = document.createElement('div')
          cube.className = 'cube'
          cube.dataset.row = String(r)
          cube.dataset.col = String(c)
          cube.style.setProperty('--half-size', `${half}px`)
          const faces = ['front', 'back', 'right', 'left', 'top', 'bottom']
          faces.forEach(f => {
            const face = document.createElement('div')
            face.className = `cube-face cube-face--${f}`
            cube.appendChild(face)
          })
          scene.appendChild(cube)
          cubesRef.current.push(cube)
        }
      }
    }

    buildGrid()

    let rafId = 0
    const handleMouse = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const mx = e.clientX
        const my = e.clientY
        cubesRef.current.forEach(cube => {
          const rect = cube.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2)
          const maxDist = 350
          if (dist < maxDist) {
            const intensity = 1 - dist / maxDist
            const dx = (mx - cx) / maxDist
            const dy = (my - cy) / maxDist
            const rotX = dy * 25 * intensity
            const rotY = -dx * 25 * intensity
            cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`
            const front = cube.querySelector('.cube-face--front') as HTMLElement
            if (front) {
              front.style.boxShadow = `inset 0 0 ${30 * intensity}px rgba(139,92,246,${0.15 * intensity})`
            }
          } else {
            cube.style.transform = 'rotateX(0) rotateY(0)'
            const front = cube.querySelector('.cube-face--front') as HTMLElement
            if (front) front.style.boxShadow = 'none'
          }
        })
      })
    }

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('resize', buildGrid)

    // Click ripple — purple wave radiating from click point
    const handleClick = (e: MouseEvent) => {
      const mx = e.clientX
      const my = e.clientY
      cubesRef.current.forEach(cube => {
        const rect = cube.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2)
        const delay = dist * 0.4
        const front = cube.querySelector('.cube-face--front') as HTMLElement
        if (dist < 600) {
          const intensity = 1 - dist / 600
          cube.style.transition = `transform 0.4s ${delay}ms cubic-bezier(0.2,0.8,0.2,1)`
          cube.style.transform = `rotateX(${(my - cy) * 0.05 * intensity}deg) rotateY(${-(mx - cx) * 0.05 * intensity}deg) scale(${1 + 0.15 * intensity})`
          if (front) {
            front.style.transition = `box-shadow 0.3s ${delay}ms ease, background 0.3s ${delay}ms ease`
            front.style.boxShadow = `inset 0 0 ${40 * intensity}px rgba(139,92,246,${0.5 * intensity}), 0 0 ${20 * intensity}px rgba(139,92,246,${0.3 * intensity})`
            front.style.background = `rgba(139,92,246,${0.08 * intensity})`
          }
          setTimeout(() => {
            cube.style.transition = 'transform 0.8s cubic-bezier(0.2,0.8,0.2,1)'
            cube.style.transform = 'rotateX(0) rotateY(0) scale(1)'
            if (front) {
              front.style.transition = 'box-shadow 0.8s ease, background 0.8s ease'
              front.style.boxShadow = 'none'
              front.style.background = ''
            }
          }, delay + 400)
        }
      })
    }
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', buildGrid)
      window.removeEventListener('click', handleClick)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Bento card mouse tracking
  useEffect(() => {
    const handleBentoMouse = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.bento-card') as NodeListOf<HTMLElement>
      cards.forEach(card => {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
      })
    }
    document.addEventListener('mousemove', handleBentoMouse)
    return () => document.removeEventListener('mousemove', handleBentoMouse)
  }, [])

  // GSAP scroll animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo('.hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
      .fromTo('.hero-title', { opacity: 0, y: 50, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1.2 }, 0.3)
      .fromTo('.hero-tagline', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6)
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.8)
      .fromTo('.hero-cta-group', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 1.0)
      .fromTo('.hero-trust', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 1.2)
      .fromTo('.scroll-indicator', { opacity: 0 }, { opacity: 1, duration: 1 }, 1.5)

    const sections = [
      '.features-header', '.bento-card', '.engines-header', '.engine-item',
      '.voices-header', '.roster-row', '.hiw-header', '.hiw-step',
      '.pricing-header', '.pricing-card', '.testimonials-header', '.testimonial-card',
      '.coming-header', '.coming-card', '.final-cta-section', '.stat-item'
    ]

    sections.forEach(selector => {
      gsap.fromTo(selector, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1,
        scrollTrigger: { trigger: selector, start: 'top 85%', toggleActions: 'play none none none' }
      })
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  // TTS Demo — real audio playback with progress tracking
  useEffect(() => {
    const audio = demoAudioRef.current
    if (!audio || !demoPlaying) return

    const updateProgress = () => {
      if (audio.duration) {
        setDemoProgress((audio.currentTime / audio.duration) * 100)
      }
    }
    const onEnded = () => {
      setDemoPlaying(false)
      setDemoProgress(100)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', onEnded)
    }
  }, [demoPlaying])

  const handleDemoPlay = async () => {
    if (demoPlaying) {
      demoAudioRef.current?.pause()
      setDemoPlaying(false)
      return
    }

    // If we already have audio from a previous generation, replay it
    if (demoAudioUrl && demoAudioRef.current) {
      demoAudioRef.current.currentTime = 0
      demoAudioRef.current.play()
      setDemoPlaying(true)
      setDemoProgress(0)
      return
    }

    // Try to generate via engine
    setDemoLoading(true)
    setDemoProgress(0)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
      const res = await fetch(`${API_BASE}/api/v1/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'voxar-dev-key-001' },
        body: JSON.stringify({
          text: demoText.trim(),
          voice_id: demoVoice.toLowerCase(),
          engine_mode: 'flash',
          language: 'auto',
          output_format: 'mp3',
        }),
      })
      const data = await res.json()
      if (data.job_id) {
        // Poll for completion
        let attempts = 0
        while (attempts < 30) {
          await new Promise(r => setTimeout(r, 2000))
          const jobRes = await fetch(`${API_BASE}/api/v1/jobs/${data.job_id}`, {
            headers: { 'X-API-Key': 'voxar-dev-key-001' },
          })
          const job = await jobRes.json()
          if (job.status === 'completed') {
            const audioUrl = job.audio_url || job.audio_path
            if (audioUrl) {
              const fullUrl = audioUrl.startsWith('http') ? audioUrl : `${API_BASE}${audioUrl}`
              setDemoAudioUrl(fullUrl)
              const audio = new Audio(fullUrl)
              demoAudioRef.current = audio
              audio.play()
              setDemoPlaying(true)
            }
            break
          }
          if (job.status === 'failed') break
          attempts++
          setDemoProgress(Math.min(90, attempts * 3))
        }
      }
    } catch {
      // Engine unavailable — redirect to login to try the full studio
      window.location.href = '/login'
    } finally {
      setDemoLoading(false)
    }
  }

  // Reset demo audio when text or voice changes
  useEffect(() => {
    setDemoAudioUrl(null)
    setDemoProgress(0)
    if (demoAudioRef.current) {
      demoAudioRef.current.pause()
      demoAudioRef.current = null
    }
    setDemoPlaying(false)
  }, [demoText, demoVoice])

  // Fetch real voice catalog for preview URLs
  useEffect(() => {
    fetch('/api/v1/voices')
      .then(r => r.json())
      .then(data => {
        if (data.voices) {
          const map: Record<string, string> = {}
          for (const v of data.voices) {
            const firstName = (v.display_name || v.name || '').split(' ')[0]
            if (v.preview_urls?.default) {
              const url = v.preview_urls.default
              map[firstName.toLowerCase()] = url.startsWith('/') ? url : `/${url}`
            }
          }
          setVoicePreviews(map)
        }
      })
      .catch(() => {})
  }, [])

  // Voice preview — real audio playback with progress tracking
  useEffect(() => {
    const audio = previewAudioRef.current
    if (!audio || previewVoice === null) return

    const updateProgress = () => {
      if (audio.duration) {
        setVoiceProgress((audio.currentTime / audio.duration) * 100)
      }
    }
    const onEnded = () => {
      setPreviewVoice(null)
      setVoiceProgress(0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', onEnded)
    }
  }, [previewVoice])

  const handleVoicePreview = (i: number) => {
    if (previewVoice === i) {
      previewAudioRef.current?.pause()
      previewAudioRef.current = null
      setPreviewVoice(null)
      setVoiceProgress(0)
      return
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
    }

    const voice = voices[i]
    const firstName = voice.name.split(' ')[0].toLowerCase()
    const previewUrl = voicePreviews[firstName]
    if (!previewUrl) return

    const audio = new Audio(previewUrl)
    previewAudioRef.current = audio
    audio.play().catch(() => {})
    setPreviewVoice(i)
    setVoiceProgress(0)
  }

  return (
    <>
      <div className="grain-overlay" />
      <div className="bg-watermark">VOXAR</div>
      <div className="ambient-orb" />
      <div className="ambient-orb-2" />
      <div id="cube-scene" ref={cubeSceneRef} />

      {/* ===== NAVIGATION ===== */}
      <Navbar />

      {/* ===== MAIN CONTENT ===== */}
      <div className="page-wrapper">

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-badge"><span className="badge-dot" /> NEXT-GEN NEURAL VOICE PLATFORM</div>
          <h1 className="hero-title">VOXAR</h1>
          <p className="hero-tagline">Your words. <strong>Studio sound.</strong></p>
          <p className="hero-subtitle">Neural voice synthesis, instant cloning, and precision transcription — 40+ premium voices across 12 languages, engineered for creators who refuse to compromise.</p>
          <div className="hero-cta-group">
            <button className="cta-primary"><IconZap size={16} /> Start Creating — Free</button>
            <button className="cta-secondary" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}><IconPlay size={18} /> Hear It Live</button>
          </div>
          <div className="hero-trust">
            <span className="hero-trust-text">Trusted by creators everywhere</span>
            <div className="hero-trust-items">
              <span className="trust-check"><IconCheck size={14} /> No credit card</span>
              <span className="trust-check"><IconCheck size={14} /> 3 min free forever</span>
              <span className="trust-check"><IconCheck size={14} /> Studio-grade quality</span>
            </div>
          </div>
          <div className="scroll-indicator">
            <div className="scroll-line" />
          </div>
        </section>

        {/* MARQUEE */}
        <section className="marquee-section">
          <div className="marquee-row">
            <div className="marquee-track">
              {[...marqueeItems1, ...marqueeItems1].map((item, i) => (
                <span className="marquee-item" key={`m1-${i}`}><span className="marquee-dot" />{item}</span>
              ))}
            </div>
          </div>
          <div className="marquee-row">
            <div className="marquee-track marquee-track--reverse">
              {[...marqueeItems2, ...marqueeItems2].map((item, i) => (
                <span className="marquee-item" key={`m2-${i}`}><span className="marquee-dot" />{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="stats-section">
          <div className="stats-bar">
            <div className="stat-item"><div className="stat-value">240+</div><div className="stat-label">Voice-Language Combos</div></div>
            <div className="stat-item"><div className="stat-value">12+</div><div className="stat-label">Languages</div></div>
            <div className="stat-item"><div className="stat-value">40+</div><div className="stat-label">Neural Voices</div></div>
            <div className="stat-item"><div className="stat-value">99.7<span style={{ fontSize: '24px' }}>%</span></div><div className="stat-label">Accuracy</div></div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section" id="features">
          <div className="container">
            <div className="features-header">
              <div className="section-tag">// Capabilities</div>
              <h2 className="features-title">Everything you need.<br />Nothing you don&apos;t.</h2>
              <p className="features-subtitle">Six core capabilities. One unified platform. Built for production-grade audio at any scale.</p>
            </div>
            <div className="bento-grid">
              <div className="bento-card bento-card--lg">
                <div className="bento-icon"><IconMic size={22} /></div>
                <h3 className="bento-title">Text-to-Speech</h3>
                <p className="bento-desc">Type anything. Get studio audio. Four generation modes — Flash for speed, Cinematic for drama, Longform for books, Multilingual for reach.</p>
                <div className="bento-tags">
                  <span className="bento-tag">Flash</span>
                  <span className="bento-tag">Cinematic</span>
                  <span className="bento-tag">Longform</span>
                  <span className="bento-tag">Multilingual</span>
                </div>
                <div className="bento-waveform">
                  {[12,24,36,18,30,14,28,20,32,16,26,22,34,10,28,18].map((h, i) => (
                    <div key={i} className="wave-bar" style={{ height: `${h}px` }} />
                  ))}
                </div>
              </div>

              <div className="bento-card">
                <div className="bento-icon"><IconCopy size={22} /></div>
                <h3 className="bento-title">Voice Cloning</h3>
                <p className="bento-desc">Upload 30 seconds of any voice. Get a flawless digital replica. Generate speech in that voice across all 12 languages instantly.</p>
                <div className="bento-tags">
                  <span className="bento-tag">30s Sample</span>
                  <span className="bento-tag">Cross-lingual</span>
                </div>
              </div>

              <div className="bento-card">
                <div className="bento-icon"><IconFileText size={22} /></div>
                <h3 className="bento-title">Speech-to-Text</h3>
                <p className="bento-desc">Upload audio or video. Get precise transcription with word-level timestamps. Supports 99 languages with unmatched accuracy.</p>
                <div className="bento-tags">
                  <span className="bento-tag">99 Languages</span>
                  <span className="bento-tag">Word-level</span>
                </div>
              </div>

              <div className="bento-card">
                <div className="bento-icon"><IconUsers size={22} /></div>
                <h3 className="bento-title">Speaker Diarization</h3>
                <p className="bento-desc">Multi-speaker audio. VOXAR identifies who said what. Perfect for podcasts, meetings, interviews, and panel discussions.</p>
                <div className="bento-tags">
                  <span className="bento-tag">Multi-speaker</span>
                  <span className="bento-tag">Auto-detect</span>
                </div>
              </div>

              <div className="bento-card bento-card--tall">
                <div className="bento-icon"><IconGlobe size={22} /></div>
                <h3 className="bento-title">12 Languages. Native Pronunciation.</h3>
                <p className="bento-desc">Not robotic transliteration. Every language sounds the way a native speaker would say it — with authentic intonation, rhythm, and cadence.</p>
                <div className="bento-lang-cloud">
                  {['English', 'Hindi', 'Hinglish', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Punjabi', 'Odia'].map((lang, i) => (
                    <span key={lang} className={`lang-chip ${i < 3 ? 'lang-chip--highlight' : ''}`}>{lang}</span>
                  ))}
                </div>
              </div>

              <div className="bento-card bento-card--lg">
                <div className="bento-icon"><IconSubtitles size={22} /></div>
                <h3 className="bento-title">Subtitle Generation</h3>
                <p className="bento-desc">Auto-generate SRT, VTT, or JSON subtitle files from any audio. Word-level precision for karaoke-style display. Ready for YouTube, Instagram, and every major platform.</p>
                <div className="bento-tags">
                  <span className="bento-tag">SRT</span>
                  <span className="bento-tag">VTT</span>
                  <span className="bento-tag">JSON</span>
                  <span className="bento-tag">Karaoke-ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VOICE GALLERY */}
        <VoiceGallery />

        {/* TTS DEMO */}
        <section className="demo-section" id="demo">
          <div className="container container--narrow">
            <div className="demo-header">
              <div className="section-tag">// Try It Live</div>
              <h2 className="demo-title">Hear the difference.</h2>
              <p className="features-subtitle" style={{ marginTop: '12px' }}>Type anything below. Pick a voice. Hit play. Experience VOXAR instantly.</p>
            </div>
            <div className="demo-card">
              <div className="demo-textarea-wrap">
                <textarea
                  className="demo-textarea"
                  value={demoText}
                  onChange={e => { if (e.target.value.length <= 200) setDemoText(e.target.value) }}
                  maxLength={200}
                  rows={3}
                  placeholder="Type something to hear..."
                />
                <span className="demo-char-count">{demoText.length}/200</span>
              </div>
              <div className="demo-controls">
                <div className="demo-voice-pills">
                  {['Arjun', 'Priya', 'Vikram', 'Maya'].map(v => (
                    <button key={v} className={`demo-voice-pill ${demoVoice === v ? 'active' : ''}`} onClick={() => setDemoVoice(v)}>{v}</button>
                  ))}
                </div>
                <button className="demo-play-btn" onClick={handleDemoPlay} disabled={!demoText.trim() || demoLoading}>
                  {demoLoading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  ) : demoPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="4" x2="6" y2="20" /><line x1="18" y1="4" x2="18" y2="20" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  )}
                  {demoLoading ? 'Generating...' : demoPlaying ? 'Playing...' : 'Play Preview'}
                </button>
              </div>
              {demoProgress > 0 && (
                <div className="demo-progress-wrap">
                  <div className="demo-progress-track">
                    <div className="demo-progress-fill" style={{ width: `${demoProgress}%` }} />
                  </div>
                  <span className="demo-progress-voice">{demoVoice} · Cinematic</span>
                </div>
              )}
              <p className="demo-note">Want studio-grade quality with all 40+ premium voices? <a href="/login">Try the full studio free →</a></p>
            </div>
          </div>
        </section>

        {/* ENGINES */}
        <section className="engines-section" id="engines">
          <div className="container">
            <div className="engines-header">
              <div>
                <div className="section-tag">// Architecture</div>
                <h2 className="engines-title">Six engines.<br />One platform.</h2>
              </div>
              <p className="engines-subtitle">Each engine is purpose-built for a specific audio intelligence task. Together, they power the most complete voice platform ever built.</p>
            </div>
            <div className="engine-grid">
              {engines.map((engine, i) => (
                <div key={i} className={`engine-item ${i === 0 ? 'active' : ''}`}>
                  <div className="engine-icon-wrap">{engine.icon}</div>
                  <div className="engine-number">{engine.num}</div>
                  <h3 className="engine-title">{engine.title}</h3>
                  <p className="engine-desc">{engine.desc}</p>
                </div>
              ))}
            </div>

            <div className="hud-wrapper">
              <div className="hud-visualizer">
                <div className="hud-ring ring-1"><span className="ring-dot" /></div>
                <div className="hud-ring ring-2"><span className="ring-dot" /></div>
                <div className="hud-ring ring-3" />
                <div className="hud-core">
                  <div className="hud-inner">
                    <IconCpu size={24} />
                  </div>
                </div>
                <span className="hud-readout readout-tl">LAT: 0.3ms</span>
                <span className="hud-readout readout-tr">THR: 98.2%</span>
                <span className="hud-readout readout-bl">QPS: 12.4K</span>
                <span className="hud-readout readout-br">STA: ACTIVE</span>
              </div>
            </div>
          </div>
        </section>

        {/* VOICES */}
        <section className="voices-section" id="voices">
          <div className="container container--narrow">
            <div className="voices-header">
              <div className="section-tag">// The Talent</div>
              <h2 className="voices-title">The premium voice library.<br />240+ combinations.</h2>
              <div className="voices-count"><span className="count-dot" /> All voices active &amp; streaming</div>
            </div>
            <div className="roster-table">
              {voices.map((voice, i) => (
                <div key={i} className={`roster-row ${previewVoice === i ? 'previewing' : ''}`} onClick={() => handleVoicePreview(i)}>
                  <span className="r-number">{voice.num}</span>
                  <div className={`track-avatar ${voice.av}`}>
                    <div className="avatar-overlay" />
                    <svg className="play-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                  <div className="r-info">
                    <div className="r-name-wrap">
                      <span className="r-name">{voice.name}</span>
                      <div className="mini-eq">
                        <div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" />
                      </div>
                    </div>
                    <span className="r-style">{voice.style}</span>
                    {previewVoice === i && (
                      <div className="voice-preview-bar">
                        <div className="voice-preview-fill" style={{ width: `${voiceProgress}%` }} />
                      </div>
                    )}
                  </div>
                  <span className="r-lang">{voice.lang}</span>
                  <div className="r-type">
                    {voice.tags.map(tag => <span key={tag} className="type-tag">{tag}</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="voices-more">
              <a href="/dashboard/voices" className="voices-more-link">Explore all 40+ premium voices <IconArrowRight size={14} /></a>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="hiw-section">
          <div className="container">
            <div className="hiw-header">
              <div className="section-tag">// How It Works</div>
              <h2 className="hiw-title">Three steps to<br />studio audio.</h2>
            </div>
            <div className="hiw-grid">
              <div className="hiw-line"><div className="hiw-line-fill" /></div>
              <div className="hiw-step">
                <div className="hiw-step-number">01</div>
                <h3 className="hiw-step-title">Write</h3>
                <p className="hiw-step-desc">Type your text — any language, any format. VOXAR handles formatting, numbers, mixed languages, and abbreviations automatically.</p>
                <div className="hiw-step-icon"><IconPencil size={24} /></div>
              </div>
              <div className="hiw-step">
                <div className="hiw-step-number">02</div>
                <h3 className="hiw-step-title">Choose</h3>
                <p className="hiw-step-desc">Pick from 40+ premium voices. Select your language. Choose Flash, Cinematic, Longform, or Multilingual mode. Preview instantly.</p>
                <div className="hiw-step-icon"><IconSettings size={24} /></div>
              </div>
              <div className="hiw-step">
                <div className="hiw-step-number">03</div>
                <h3 className="hiw-step-title">Ship</h3>
                <p className="hiw-step-desc">Download studio-grade MP3 (320kbps) or WAV lossless. No watermark on paid plans. Production-ready. Instantly.</p>
                <div className="hiw-step-icon"><IconDownload size={24} /></div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="pricing-section" id="pricing">
          <div className="container">
            <div className="pricing-header">
              <div className="section-tag">// Pricing</div>
              <h2 className="pricing-title">Simple pricing.<br />Generous limits.</h2>
              <p className="pricing-subtitle">Start free. Scale as you grow. Every plan includes identical studio-grade audio quality.</p>
            </div>
            <PricingCards />
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <div className="container container--narrow">
            <div className="faq-header">
              <div className="section-tag">// FAQ</div>
              <h2 className="faq-title">Common questions.</h2>
            </div>
            <div className="faq-list">
              {faqItems.map((item, i) => (
                <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`}>
                  <button className="faq-question" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                    {item.q}
                    <IconPlus size={18} />
                  </button>
                  <div className="faq-answer">
                    <p className="faq-answer-text">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="testimonials-section">
          <div className="container">
            <div className="testimonials-header">
              <div className="section-tag">// What Creators Say</div>
              <h2 className="testimonials-title">Loved by creators<br />worldwide.</h2>
            </div>
            <div className="testimonials-grid">
              {testimonials.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="testimonial-stars">
                    {Array.from({ length: 5 }).map((_, j) => <IconStar key={j} size={14} />)}
                  </div>
                  <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" style={{ background: t.gradient }}>
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMING SOON */}
        <section className="coming-section">
          <div className="container">
            <div className="coming-header">
              <div className="section-tag">// Roadmap</div>
              <h2 className="coming-title">And we&apos;re just<br />getting started.</h2>
            </div>
            <div className="coming-grid">
              {comingCards.map((card, i) => (
                <div key={i} className="coming-card">
                  <div className="coming-card-icon">{card.icon}</div>
                  <h3 className="coming-card-title">{card.title}</h3>
                  <span className="coming-badge">{card.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta-section">
          <div className="final-cta-bg" />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>// Get Started</div>
            <h2 className="final-cta-title">Your next satisfying<br />voice is waiting.</h2>
            <p className="final-cta-subtitle">Join thousands of creators already using VOXAR. Start free. No credit card. No compromise.</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="cta-primary" style={{ padding: '18px 48px', fontSize: '15px', borderRadius: '16px' }}>
                <IconZap size={18} />
                Start Creating — It&apos;s Free
              </button>
            </div>
            <p className="final-cta-trust">No credit card required &nbsp;·&nbsp; 3 minutes free &nbsp;·&nbsp; Upgrade anytime</p>
          </div>
        </section>

        {/* FOOTER */}
        <Footer />

      </div>
    </>
  )
}
