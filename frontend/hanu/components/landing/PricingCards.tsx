'use client'

import { useState, useRef } from 'react'
import { IconGift, IconKey, IconWaveform, IconMic, IconCpu, IconBuilding, IconCheckSmall, IconX, IconChevronLeft, IconChevronRight } from './Icons'

export default function PricingCards() {
  const [isAnnual, setIsAnnual] = useState(false)
  const pricingGridRef = useRef<HTMLDivElement>(null)

  const scrollPricing = (dir: 'left' | 'right') => {
    if (pricingGridRef.current) {
      const scrollAmount = dir === 'left' ? -400 : 400
      pricingGridRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <>
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
          <a href="/login" className="card-cta card-cta-outline" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center' }}>Start Free</a>
          <div className="features-label">What&apos;s included</div>
          <ul className="feature-list">
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> 10 minutes TTS / month</li>
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> 5 min transcription</li>
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> All voices &amp; languages</li>
            <li className="feature-item"><span className="feature-icon disabled"><IconX /></span> Voice cloning</li>
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> Watermarked output</li>
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> Resets monthly</li>
          </ul>
        </div>
        {/* ACCESS */}
        <div className="pricing-card">
          <div className="card-tier-icon"><IconKey size={22} /></div>
          <div className="card-tier-name">Tier 02</div>
          <h3 className="pricing-plan-name">Access</h3>
          <div className="card-price"><span className="price-amount">{isAnnual ? '₹199' : '₹249'}</span><span className="price-period">/month</span></div>
          <p className="price-note">{isAnnual ? '₹199/mo billed annually' : '₹249/mo billed monthly'}</p>
          <a href="/login" className="card-cta card-cta-outline" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center' }}>Get Access</a>
          <div className="features-label">What&apos;s included</div>
          <ul className="feature-list">
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> 30 minutes TTS / month</li>
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> 1 voice clone</li>
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> 15 min transcription</li>
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> No watermark</li>
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> MP3 320kbps + WAV</li>
            <li className="feature-item"><span className="feature-icon disabled"><IconX /></span> API access</li>
          </ul>
        </div>
        {/* STARTER (Featured — MOST POPULAR) */}
        <div className="pricing-card pricing-card--featured">
          <span className="popular-tag">MOST POPULAR</span>
          <div className="card-tier-icon"><IconWaveform size={22} /></div>
          <div className="card-tier-name">Tier 03</div>
          <h3 className="pricing-plan-name">Starter</h3>
          <div className="card-price"><span className="price-amount">{isAnnual ? '₹499' : '₹599'}</span><span className="price-period">/month</span></div>
          <p className="price-note">{isAnnual ? '₹499/mo billed annually' : '₹599/mo billed monthly'}</p>
          <a href="/login" className="card-cta card-cta-filled" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center' }}>Get Starter</a>
          <div className="features-label">Everything in Access, plus</div>
          <ul className="feature-list">
            <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 120 minutes TTS / month</li>
            <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 3 voice clones</li>
            <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 1 hour transcription</li>
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
          <a href="/login" className="card-cta card-cta-outline" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center' }}>Get Creator</a>
          <div className="features-label">Everything in Starter, plus</div>
          <ul className="feature-list">
            <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 300 minutes TTS / month</li>
            <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 5 voice clones</li>
            <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 2.5 hours transcription</li>
            <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> Add-ons support</li>
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
          <a href="/login" className="card-cta card-cta-filled" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center' }}>Get Pro</a>
          <div className="features-label">Everything in Creator, plus</div>
          <ul className="feature-list">
            <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 1,000 minutes TTS / month</li>
            <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 15 voice clones</li>
            <li className="feature-item"><span className="feature-icon pro"><IconCheckSmall /></span> 8+ hours transcription</li>
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
          <a href="/login" className="card-cta card-cta-enterprise" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center' }}>Contact Sales</a>
          <div className="features-label">Everything in Pro, plus</div>
          <ul className="feature-list">
            <li className="feature-item"><span className="feature-icon"><IconCheckSmall /></span> 3,000+ minutes TTS</li>
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
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>No credit card required for the free plan.<br />
        Need something specific? <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px solid rgba(139,92,246,.3)', transition: 'border-color .2s ease' }}>Talk to our team</a></p>
      </div>
    </>
  )
}
