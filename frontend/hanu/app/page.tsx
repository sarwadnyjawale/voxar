'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// ===== SVG ICON COMPONENTS =====
const IconZap = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
)
const IconPlay = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
)
const IconCheck = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
)
const IconCheckSmall = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
)
const IconX = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
)
const IconPlus = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
)
const IconArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
)
const IconChevronLeft = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
)
const IconChevronRight = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
)
const IconSun = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
)
const IconMoon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
)
const IconStar = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
)
const IconMic = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
)
const IconCopy = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
)
const IconFileText = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
)
const IconUsers = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
)
const IconGlobe = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
)
const IconSubtitles = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="6" y1="16" x2="14" y2="16" /></svg>
)
const IconCpu = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>
)
const IconLanguages = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" /></svg>
)
const IconSliders = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
)
const IconPencil = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
)
const IconSettings = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
)
const IconDownload = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
)
const IconGift = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
)
const IconKey = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
)
const IconWaveform = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h2l3-9 3 18 3-12 3 6h4" /></svg>
)
const IconBuilding = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>
)
const IconFilm = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>
)
const IconPodcast = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="11" r="1" /><path d="M11 17a1 1 0 0 1 2 0c0 .5-.34 3-.5 4.5a.5.5 0 0 1-1 0c-.16-1.5-.5-4-.5-4.5Z" /><path d="M8 14a5 5 0 1 1 8 0" /><path d="M17 18.5a9 9 0 1 0-10 0" /></svg>
)
const IconPenTool = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></svg>
)
const IconBookOpen = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
)
const IconRepeat = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
)
const IconTheater = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10s3-3 10-3 10 3 10 3" /><path d="M2 10s3 3 10 3 10-3 10-3" /><path d="M2 10v4s3 3 10 3 10-3 10-3v-4" /><circle cx="8" cy="10" r="1" /><circle cx="16" cy="10" r="1" /></svg>
)
const IconStore = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-4h16l1 4" /><path d="M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9" /><path d="M9 21V9" /><line x1="3" y1="9" x2="21" y2="9" /></svg>
)
const IconScanFace = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="4" /><path d="M12 8v1" /><path d="M12 15v1" /></svg>
)
const IconTwitter = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>
)
const IconGithub = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
)
const IconLinkedin = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
)
const IconYoutube = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
)

const VoxarLogo = ({ width = 48 }: { width?: number }) => (
  <svg viewBox="0 0 100 50" style={{ width: `${width}px`, height: 'auto', color: 'var(--text-primary)', filter: 'drop-shadow(0 0 12px var(--accent-glow-md))' }} fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 5 25 L 20 25 C 26 25, 30 10, 35 10 C 38 10, 40 16, 42 22" />
    <path d="M 38 14 L 47 36 C 48.5 40, 51.5 40, 53 36 L 63 14 C 65 8, 69 8, 71 14 C 73 21, 76 25, 82 25 L 95 25" />
  </svg>
)
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
  const [isLightMode, setIsLightMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAnnual, setIsAnnual] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [demoText, setDemoText] = useState('Welcome to VOXAR. Experience studio-grade voice synthesis in seconds.')
  const [demoVoice, setDemoVoice] = useState('Arjun')
  const [demoPlaying, setDemoPlaying] = useState(false)
  const [demoProgress, setDemoProgress] = useState(0)
  const [previewVoice, setPreviewVoice] = useState<number | null>(null)
  const [voiceProgress, setVoiceProgress] = useState(0)

  const cubeSceneRef = useRef<HTMLDivElement>(null)
  const cubesRef = useRef<HTMLDivElement[]>([])
  const navRef = useRef<HTMLElement>(null)
  const pricingGridRef = useRef<HTMLDivElement>(null)

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setIsLightMode(prev => {
      const next = !prev
      document.body.classList.toggle('light-mode', next)
      localStorage.setItem('voxar-theme', next ? 'light' : 'dark')
      return next
    })
  }, [])

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem('voxar-theme')
    if (saved === 'light') {
      document.body.classList.add('light-mode')
      setIsLightMode(true)
    }
  }, [])

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

    // Item 11: Click ripple — purple wave radiating from click point
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

  // GSAP scroll animations
  useEffect(() => {
    // Hero entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo('.hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
      .fromTo('.hero-title', { opacity: 0, y: 50, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1.2 }, 0.3)
      .fromTo('.hero-tagline', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6)
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 0.8)
      .fromTo('.hero-cta-group', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 1.0)
      .fromTo('.hero-trust', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 1.2)
      .fromTo('.scroll-indicator', { opacity: 0 }, { opacity: 1, duration: 1 }, 1.5)

    // Section animations
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

  // TTS Demo play simulation
  useEffect(() => {
    if (!demoPlaying) return
    const interval = setInterval(() => {
      setDemoProgress(prev => {
        if (prev >= 100) { setDemoPlaying(false); return 100 }
        return prev + 0.8
      })
    }, 50)
    return () => clearInterval(interval)
  }, [demoPlaying])

  // Voice preview progress
  useEffect(() => {
    if (previewVoice === null) return
    const interval = setInterval(() => {
      setVoiceProgress(prev => {
        if (prev >= 100) { setPreviewVoice(null); return 0 }
        return prev + 1.5
      })
    }, 50)
    return () => clearInterval(interval)
  }, [previewVoice])

  // Pricing scroll
  const scrollPricing = (dir: 'left' | 'right') => {
    if (pricingGridRef.current) {
      const scrollAmount = dir === 'left' ? -400 : 400
      pricingGridRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Item 14: GSAP smooth scroll for nav links
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
      <div className="grain-overlay" />
      <div className="bg-watermark">VOXAR</div>
      <div className="ambient-orb" />
      <div className="ambient-orb-2" />
      <div id="cube-scene" ref={cubeSceneRef} />

      {/* ===== NAVIGATION ===== */}
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
            {isLightMode ? <IconMoon size={18} /> : <IconSun size={18} />}
          </button>
          <div className="nav-divider" />
          <a href="/login" className="nav-cta-btn">
            Start Creating
          </a>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
              <span /><span /><span />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}>
        <a href="#features" className="nav-link" onClick={(e) => handleNavClick(e, '#features')}>Platform</a>
        <a href="#voices" className="nav-link" onClick={(e) => handleNavClick(e, '#voices')}>Voices</a>
        <a href="#pricing" className="nav-link" onClick={(e) => handleNavClick(e, '#pricing')}>Pricing</a>
        <a href="#engines" className="nav-link" onClick={(e) => handleNavClick(e, '#engines')}>Engines</a>
        <a href="#" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Docs</a>
        <div style={{ height: '16px' }} />
        <button className="cta-primary" onClick={() => setMobileMenuOpen(false)}>Start Creating Free</button>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="page-wrapper">

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-badge"><span className="badge-dot" /> NEXT-GEN NEURAL VOICE PLATFORM</div>
          <h1 className="hero-title">VOXAR</h1>
          <p className="hero-tagline">Your words. <strong>Studio sound.</strong></p>
          <p className="hero-subtitle">Neural voice synthesis, instant cloning, and precision transcription — 20 voices across 12 languages, engineered for creators who refuse to compromise.</p>
          <div className="hero-cta-group">
            <button className="cta-primary"><IconZap size={16} /> Start Creating — Free</button>
            <button className="cta-secondary"><IconPlay size={18} /> Hear It Live</button>
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
            <div className="stat-item"><div className="stat-value">20+</div><div className="stat-label">Neural Voices</div></div>
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
              {/* Card 1: TTS (Large) */}
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

              {/* Card 2: Voice Cloning */}
              <div className="bento-card">
                <div className="bento-icon"><IconCopy size={22} /></div>
                <h3 className="bento-title">Voice Cloning</h3>
                <p className="bento-desc">Upload 30 seconds of any voice. Get a flawless digital replica. Generate speech in that voice across all 12 languages instantly.</p>
                <div className="bento-tags">
                  <span className="bento-tag">30s Sample</span>
                  <span className="bento-tag">Cross-lingual</span>
                </div>
              </div>

              {/* Card 3: Speech-to-Text */}
              <div className="bento-card">
                <div className="bento-icon"><IconFileText size={22} /></div>
                <h3 className="bento-title">Speech-to-Text</h3>
                <p className="bento-desc">Upload audio or video. Get precise transcription with word-level timestamps. Supports 99 languages with unmatched accuracy.</p>
                <div className="bento-tags">
                  <span className="bento-tag">99 Languages</span>
                  <span className="bento-tag">Word-level</span>
                </div>
              </div>

              {/* Card 4: Speaker Diarization */}
              <div className="bento-card">
                <div className="bento-icon"><IconUsers size={22} /></div>
                <h3 className="bento-title">Speaker Diarization</h3>
                <p className="bento-desc">Multi-speaker audio. VOXAR identifies who said what. Perfect for podcasts, meetings, interviews, and panel discussions.</p>
                <div className="bento-tags">
                  <span className="bento-tag">Multi-speaker</span>
                  <span className="bento-tag">Auto-detect</span>
                </div>
              </div>

              {/* Card 5: 12 Languages (Tall) */}
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

              {/* Card 6: Subtitle Generation (Large) */}
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

        {/* TTS DEMO (Item 12) */}
        <section className="demo-section" id="demo">
          <div className="container container--narrow">
            <div className="demo-header">
              <div className="section-tag">// Try It Live</div>
              <h2 className="demo-title">Hear the difference.</h2>
              <p className="features-subtitle" style={{ marginTop: '12px' }}>Type anything below. Pick a voice. Hit play. No signup required.</p>
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
                <button className="demo-play-btn" onClick={() => { if (demoProgress >= 100) setDemoProgress(0); setDemoPlaying(!demoPlaying) }} disabled={!demoText.trim()}>
                  {demoPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="4" x2="6" y2="20" /><line x1="18" y1="4" x2="18" y2="20" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  )}
                  {demoPlaying ? 'Playing...' : 'Play Preview'}
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
              <p className="demo-note">Want studio-grade quality with all 20 voices? <a href="/login">Try the full studio free →</a></p>
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
                <div key={i} className={`roster-row ${previewVoice === i ? 'previewing' : ''}`} onClick={() => { setPreviewVoice(previewVoice === i ? null : i); setVoiceProgress(0) }}>
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
              <a href="#" className="voices-more-link">Explore all 20 voices <IconArrowRight size={14} /></a>
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
                <p className="hiw-step-desc">Pick from 20 neural voices. Select your language. Choose Flash, Cinematic, Longform, or Multilingual mode. Preview instantly.</p>
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
            <div className="billing-toggle">
              <span className={`billing-label ${!isAnnual ? 'active' : ''}`} onClick={() => setIsAnnual(false)}>Monthly</span>
              <div className={`billing-switch ${isAnnual ? 'active' : ''}`} onClick={() => setIsAnnual(!isAnnual)}>
                <div className="billing-switch-knob" />
              </div>
              <span className={`billing-label ${isAnnual ? 'active' : ''}`} onClick={() => setIsAnnual(true)}>Annual</span>
              <span className={`billing-save ${isAnnual ? 'visible' : ''}`}>SAVE 20%</span>
            </div>
            <div className="pricing-grid" ref={pricingGridRef}>
              {/* FREE */}
              <div className="pricing-card">
                <div className="card-tier-icon"><IconGift size={22} /></div>
                <div className="card-tier-name">Tier 01</div>
                <h3 className="pricing-plan-name">Free</h3>
                <div className="card-price"><span className="price-amount">₹0</span></div>
                <p className="price-note">Free forever — no credit card required</p>
                <button className="card-cta card-cta-outline">Start Free</button>
                <div className="features-label">What&apos;s included</div>
                <ul className="feature-list">
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> 3 minutes TTS (lifetime)</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> All 20 voices</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> All 12 languages</li>
                  <li className="feature-item"><span className="feature-icon disabled"><IconX /></span> Voice cloning</li>
                  <li className="feature-item"><span className="feature-icon disabled"><IconX /></span> Transcription</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> Watermarked output</li>
                </ul>
              </div>
              {/* ACCESS */}
              <div className="pricing-card">
                <div className="card-tier-icon"><IconKey size={22} /></div>
                <div className="card-tier-name">Tier 02</div>
                <h3 className="pricing-plan-name">Access</h3>
                <div className="card-price"><span className="price-amount">{isAnnual ? '₹159' : '₹199'}</span><span className="price-period">/month</span></div>
                <p className="price-note">{isAnnual ? '₹159/mo billed annually' : '₹199/mo billed monthly'}</p>
                <button className="card-cta card-cta-outline">Get Access</button>
                <div className="features-label">What&apos;s included</div>
                <ul className="feature-list">
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> 10 minutes TTS / month</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> 1 voice clone</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> 15 min transcription</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> No watermark</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> MP3 320kbps + WAV</li>
                  <li className="feature-item"><span className="feature-icon disabled"><IconX /></span> API access</li>
                </ul>
              </div>
              {/* STARTER (Featured) */}
              <div className="pricing-card pricing-card--featured">
                <span className="popular-tag">MOST POPULAR</span>
                <div className="card-tier-icon"><IconWaveform size={22} /></div>
                <div className="card-tier-name">Tier 03</div>
                <h3 className="pricing-plan-name">Starter</h3>
                <div className="card-price"><span className="price-amount">{isAnnual ? '₹399' : '₹499'}</span><span className="price-period">/month</span></div>
                <p className="price-note">{isAnnual ? '₹399/mo billed annually' : '₹499/mo billed monthly'}</p>
                <button className="card-cta card-cta-filled">Get Starter</button>
                <div className="features-label">Everything in Access, plus</div>
                <ul className="feature-list">
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 120 minutes TTS / month</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 3 voice clones</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 5 hours transcription</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> Speaker diarization</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> Subtitle export (SRT, VTT)</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> All generation modes</li>
                </ul>
              </div>
              {/* CREATOR */}
              <div className="pricing-card">
                <div className="card-tier-icon"><IconMic size={22} /></div>
                <div className="card-tier-name">Tier 04</div>
                <h3 className="pricing-plan-name">Creator</h3>
                <div className="card-price"><span className="price-amount">{isAnnual ? '₹1,199' : '₹1,499'}</span><span className="price-period">/month</span></div>
                <p className="price-note">{isAnnual ? '₹1,199/mo billed annually' : '₹1,499/mo billed monthly'}</p>
                <button className="card-cta card-cta-outline">Get Creator</button>
                <div className="features-label">Everything in Starter, plus</div>
                <ul className="feature-list">
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 500 minutes TTS / month</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 10 voice clones</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 20 hours transcription</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> All features included</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> Priority processing</li>
                  <li className="feature-item"><span className="feature-icon disabled"><IconX /></span> API access</li>
                </ul>
              </div>
              {/* PRO */}
              <div className="pricing-card pricing-card--featured">
                <span className="popular-tag">BEST VALUE</span>
                <div className="card-tier-icon"><IconCpu size={22} /></div>
                <div className="card-tier-name">Tier 05</div>
                <h3 className="pricing-plan-name">Pro</h3>
                <div className="card-price"><span className="price-amount">{isAnnual ? '₹3,999' : '₹4,999'}</span><span className="price-period">/month</span></div>
                <p className="price-note">{isAnnual ? '₹3,999/mo billed annually' : '₹4,999/mo billed monthly'}</p>
                <button className="card-cta card-cta-filled">Get Pro</button>
                <div className="features-label">Everything in Creator, plus</div>
                <ul className="feature-list">
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 2,000 minutes TTS / month</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 25 voice clones</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 100 hours transcription</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> Full API access</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> Webhooks &amp; SDKs</li>
                  <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> Priority support</li>
                </ul>
              </div>
              {/* ENTERPRISE */}
              <div className="pricing-card">
                <div className="card-tier-icon"><IconBuilding size={22} /></div>
                <div className="card-tier-name">Tier 06</div>
                <h3 className="pricing-plan-name">Enterprise</h3>
                <div className="card-price"><span className="price-amount">Custom</span></div>
                <p className="price-note">Tailored to your scale</p>
                <button className="card-cta card-cta-enterprise">Contact Sales</button>
                <div className="features-label">Everything in Pro, plus</div>
                <ul className="feature-list">
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> Unlimited TTS</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> Unlimited voice clones</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> Unlimited transcription</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> Dedicated infrastructure</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> Custom SLA &amp; support</li>
                  <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> SSO &amp; team management</li>
                </ul>
              </div>
            </div>
            <div className="pricing-scroll-nav">
              <button className="pricing-scroll-btn" onClick={() => scrollPricing('left')}><IconChevronLeft /></button>
              <button className="pricing-scroll-btn" onClick={() => scrollPricing('right')}><IconChevronRight /></button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '64px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>All plans include a <strong>14-day free trial</strong>. No credit card required.<br />
              Need something specific? <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px solid rgba(139,92,246,.3)', transition: 'border-color .2s ease' }}>Talk to our team</a></p>
            </div>
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
        <footer className="footer">
          <div className="container">
            <div className="footer-top">
              <div>
                <div className="footer-logo">
                  <VoxarLogo width={32} />
                  <span className="footer-logo-text">VOXAR</span>
                </div>
                <p className="footer-tagline">AI Voice Infrastructure for Multilingual Creators.</p>
              </div>
              <div>
                <h4 className="footer-col-title">Product</h4>
                <ul className="footer-col-links">
                  <li><a href="#">Text-to-Speech</a></li>
                  <li><a href="#">Voice Cloning</a></li>
                  <li><a href="#">Transcription</a></li>
                  <li><a href="#">Voice Library</a></li>
                  <li><a href="#">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-col-title">Resources</h4>
                <ul className="footer-col-links">
                  <li><a href="#">API Docs</a></li>
                  <li><a href="#">Changelog</a></li>
                  <li><a href="#">Status Page</a></li>
                  <li><a href="#">Help Center</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-col-title">Company</h4>
                <ul className="footer-col-links">
                  <li><a href="#">About</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Careers</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-col-title">Legal</h4>
                <ul className="footer-col-links">
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Refund Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <span className="footer-copy">© 2026 VOXAR. All rights reserved.</span>
              <div className="footer-socials">
                <a href="#" className="footer-social"><IconTwitter /></a>
                <a href="#" className="footer-social"><IconGithub /></a>
                <a href="#" className="footer-social"><IconLinkedin /></a>
                <a href="#" className="footer-social"><IconYoutube /></a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
