'use client'

import DashHeader from '@/components/dashboard/DashHeader'
import { IconPlus } from '@/components/landing/Icons'

const mockProjects = [
  {
    id: 'p1',
    title: 'Product Launch Narration',
    description: 'Multi-voice narration for the Q2 product launch video. 3 speakers, English.',
    blocks: 12,
    duration: '4:35',
    updated: '2 hours ago',
    voice: 'Arjun, Priya',
  },
  {
    id: 'p2',
    title: 'Hindi Podcast Intro',
    description: 'Cinematic podcast intro with background music bed and dual narrators.',
    blocks: 5,
    duration: '1:20',
    updated: 'Yesterday',
    voice: 'Kavya',
  },
  {
    id: 'p3',
    title: 'E-Learning Module 7',
    description: 'Educational content for the digital marketing course. Longform generation.',
    blocks: 28,
    duration: '15:42',
    updated: 'Mar 5',
    voice: 'Vikram, Maya',
  },
]

export default function ProjectsPage() {
  return (
    <>
      <DashHeader
        breadcrumbs={[
          { label: 'Studio' },
          { label: 'Projects' }
        ]}
      />

      <div className="dp-scroll">
        <div className="dp-header">
          <div className="dp-header-row">
            <div>
              <h2 className="dp-title">Projects</h2>
              <p className="dp-subtitle">Manage your studio projects. Each project contains speech blocks, voice assignments, and timeline data.</p>
            </div>
            <a href="/dashboard/studio" className="btn-generate" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <IconPlus size={14} />
              New Project
            </a>
          </div>
        </div>

        <div className="dp-project-grid">
          {/* New Project Card */}
          <a href="/dashboard/studio" className="dp-project-card dp-project-new" style={{ textDecoration: 'none' }}>
            <div className="dp-project-new-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </div>
            <span className="dp-project-new-label">Create New Project</span>
          </a>

          {/* Existing Projects */}
          {mockProjects.map(project => (
            <a key={project.id} href="/dashboard/studio" className="dp-project-card" style={{ textDecoration: 'none' }}>
              <div className="dp-project-card-header">
                <div className="dp-project-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                </div>
                <span className="dp-type-badge dp-type-badge--tts">{project.blocks} blocks</span>
              </div>
              <div className="dp-project-card-title">{project.title}</div>
              <div className="dp-project-card-desc">{project.description}</div>
              <div className="dp-project-card-meta">
                <span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {project.duration}
                </span>
                <span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
                  {project.voice}
                </span>
                <span>{project.updated}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
