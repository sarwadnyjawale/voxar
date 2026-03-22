'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { IconMoon, IconSun } from './Icons'
import { VoxarLogo } from './Icons'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

gsap.registerPlugin(ScrollToPlugin)

export default function Navbar() {
  const { isLight, toggleTheme } = useThemeStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  // Navigation scroll
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 60)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const target = document.querySelector(id)
    if (target) {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: target as Element, offsetY: 80 },
        ease: 'power3.inOut'
      })
    }
    setMobileMenuOpen(false)
  }, [])

  return (
    <>
      <nav className="top-nav" ref={navRef}>
        <a href="/" className="nav-logo">
          <VoxarLogo width={42} />
          <span className="nav-logo-text">VOXAR</span>
        </a>
        <div className="nav-center">
          <a href="#features" className="nav-link" onClick={(e) => handleNavClick(e, '#features')}>Platform</a>
          <a href="#voices" className="nav-link" onClick={(e) => handleNavClick(e, '#voices')}>Voices</a>
          <a href="#pricing" className="nav-link" onClick={(e) => handleNavClick(e, '#pricing')}>Pricing</a>
          <a href="#engines" className="nav-link" onClick={(e) => handleNavClick(e, '#engines')}>Engines</a>
          <a href="#" className="nav-link">Docs</a>
        </div>
        <div className="nav-right">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {isLight ? <IconMoon size={18} /> : <IconSun size={18} />}
          </button>
          <div className="nav-divider" />
          <a href={isAuthenticated ? '/dashboard' : '/login'} className="nav-cta-btn">
            {isAuthenticated ? 'Dashboard' : 'Start Creating'}
          </a>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
              <span /><span /><span />
            </div>
          </button>
        </div>
      </nav>

      <div className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}>
        <a href="#features" className="nav-link" onClick={(e) => handleNavClick(e, '#features')}>Platform</a>
        <a href="#voices" className="nav-link" onClick={(e) => handleNavClick(e, '#voices')}>Voices</a>
        <a href="#pricing" className="nav-link" onClick={(e) => handleNavClick(e, '#pricing')}>Pricing</a>
        <a href="#engines" className="nav-link" onClick={(e) => handleNavClick(e, '#engines')}>Engines</a>
        <a href="#" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Docs</a>
        <div style={{ height: '16px' }} />
        <a href={isAuthenticated ? '/dashboard' : '/login'} className="cta-primary" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
          {isAuthenticated ? 'Go to Dashboard' : 'Start Creating Free'}
        </a>
      </div>
    </>
  )
}
