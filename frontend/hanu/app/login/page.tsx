'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [remember, setRemember] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const formPanelRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)

  // Theme persistence
  useEffect(() => {
    const saved = localStorage.getItem('voxar-theme')
    if (saved === 'light') document.body.classList.add('light-mode')
  }, [])

  // GSAP staggered entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Brand panel entrance
      gsap.fromTo('.brand-logo', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' })
      gsap.fromTo('.brand-headline', { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.4, ease: 'power3.out' })
      gsap.fromTo('.brand-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' })

      // Form panel entrance
      gsap.fromTo('.auth-header', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.3, ease: 'power3.out' })
      gsap.fromTo('.auth-tabs', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.45, ease: 'power3.out' })
      gsap.fromTo('.form-group', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.55, ease: 'power3.out' })
      gsap.fromTo('.btn-primary', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.85, ease: 'power3.out' })
      gsap.fromTo('.auth-divider', { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.95, ease: 'power3.out' })
      gsap.fromTo('.social-btns', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, delay: 1.05, ease: 'power3.out' })
      gsap.fromTo('.auth-terms', { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 1.15, ease: 'power3.out' })
    })
    return () => ctx.revert()
  }, [])

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { showToast('Please fill in all fields', 'error'); return }
    if (isSignUp && !name) { showToast('Please enter your name', 'error'); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast(isSignUp ? 'Account created!' : 'Welcome back!', 'success')
      setTimeout(() => router.push('/dashboard'), 800)
    }, 1500)
  }

  return (
    <div className="login-page">
      {/* Toast */}
      {toast && (
        <div className={`toast visible`}>
          <div className={`toast-icon toast-icon--${toast.type}`}>
            {toast.type === 'success' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            )}
          </div>
          {toast.msg}
        </div>
      )}

      {/* Left Brand Panel */}
      <div className="auth-brand">
        <div className="aurora">
          <div className="aurora-blob" />
          <div className="aurora-blob" />
          <div className="aurora-blob" />
        </div>
        <div className="grid-overlay" />
        <div className="brand-content">
          <div className="brand-logo">
            <svg viewBox="0 0 100 50" style={{ width: '56px', height: 'auto', color: 'var(--text-primary)', filter: 'drop-shadow(0 0 12px var(--accent-glow-md))' }} fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 5 25 L 20 25 C 26 25, 30 10, 35 10 C 38 10, 40 16, 42 22" />
              <path d="M 38 14 L 47 36 C 48.5 40, 51.5 40, 53 36 L 63 14 C 65 8, 69 8, 71 14 C 73 21, 76 25, 82 25 L 95 25" />
            </svg>
            <span className="brand-logo-text">VOXAR</span>
          </div>
          <h1 className="brand-headline">Every voice.<br />One platform.</h1>
          <p className="brand-sub">AI voice synthesis, cloning, and transcription — across 12 languages.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-header">
          <h2 className="auth-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {isSignUp ? 'Already have an account? ' : 'New to VOXAR? '}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp) }}>
              {isSignUp ? 'Sign in' : 'Create an account'}
            </a>
          </p>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${!isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(false)}>Sign In</div>
          <div className={`auth-tab ${isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(true)}>Sign Up</div>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Full Name
              </label>
              <div className="form-input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <input className="form-input" type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              Email
            </label>
            <div className="form-input-wrap">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Password
            </label>
            <div className="form-input-wrap">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>}
                </svg>
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="form-row">
              <label className="form-checkbox">
                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
                <span className="checkbox-custom">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                Remember me
              </label>
              <a href="#" className="form-link">Forgot password?</a>
            </div>
          )}

          <button type="submit" className={`btn-primary ${loading ? 'loading' : ''}`}>
            <span className="btn-text">{isSignUp ? 'Create Account' : 'Sign In'}</span>
            <span className="btn-loader"><span className="spinner" /></span>
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or continue with</span>
          <div className="auth-divider-line" />
        </div>

        <div className="social-btns">
          <button className="btn-social" onClick={() => { showToast('Google auth coming soon', 'success') }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            Continue with Google
          </button>
        </div>

        <p className="auth-terms">
          By continuing, you agree to VOXAR&apos;s <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}