'use client'

import DashHeader from '@/components/dashboard/DashHeader'
import {
  IconFilm, IconPodcast, IconPenTool, IconBookOpen,
  IconRepeat, IconTheater, IconStore, IconScanFace
} from '@/components/landing/Icons'

const futureTools = [
  {
    title: 'AI Video Dubbing',
    desc: 'Automatically dub videos into 12 languages with lip-sync. Upload any video and get a dubbed version in minutes.',
    icon: <IconFilm size={24} />,
  },
  {
    title: 'AI Podcast Generator',
    desc: 'Generate full podcast episodes from text scripts. Multi-speaker support with automatic music beds and transitions.',
    icon: <IconPodcast size={24} />,
  },
  {
    title: 'AI Script Writer',
    desc: 'AI-powered script generation for narrations, ads, podcasts, and educational content. Multiple tone and style options.',
    icon: <IconPenTool size={24} />,
  },
  {
    title: 'AI Audiobook Creator',
    desc: 'Convert entire books into studio-grade audiobooks with chapter detection, multiple narrators, and auto-mastering.',
    icon: <IconBookOpen size={24} />,
  },
  {
    title: 'Content Repurposer',
    desc: 'Transform blog posts, articles, and newsletters into engaging audio content. One-click conversion with smart formatting.',
    icon: <IconRepeat size={24} />,
  },
  {
    title: 'Real-time Voice Changer',
    desc: 'Change your voice in real-time during calls, streams, and recordings. Choose from 20+ voice personas.',
    icon: <IconTheater size={24} />,
  },
  {
    title: 'Voice Marketplace',
    desc: 'Browse and purchase premium voice models from professional voice actors. License voices for commercial projects.',
    icon: <IconStore size={24} />,
  },
  {
    title: 'AI Lip Sync',
    desc: 'Generate realistic lip-sync animations from audio. Perfect for avatar-based content and animated characters.',
    icon: <IconScanFace size={24} />,
  },
]

export default function FutureToolsPage() {
  return (
    <>
      <DashHeader
        breadcrumbs={[
          { label: 'Studio' },
          { label: 'Future Tools' }
        ]}
      />

      <div className="dp-scroll">
        <div className="dp-header">
          <div className="dp-header-row">
            <div>
              <h2 className="dp-title">Future Tools</h2>
              <p className="dp-subtitle">
                Upcoming capabilities on the VOXAR roadmap. These tools are currently in development and will be available soon.
              </p>
            </div>
          </div>
        </div>

        <div className="dp-future-grid">
          {futureTools.map((tool, i) => (
            <div key={i} className="dp-future-card">
              <div className="dp-future-card-icon">
                {tool.icon}
              </div>
              <div className="dp-future-card-title">{tool.title}</div>
              <div className="dp-future-card-desc">{tool.desc}</div>
              <span className="dp-future-badge">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
