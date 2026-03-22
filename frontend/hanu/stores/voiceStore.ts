import { create } from 'zustand'
import { api } from '../lib/api'

export interface CatalogVoice {
  id: string
  name: string
  display_name?: string
  gender?: string
  languages?: string[]
  primary_language?: string
  styles?: string[]
  tags?: string[]
  description?: string
  quality_score?: number
  preview_urls?: Record<string, string>
}

export interface ClonedVoice {
  _id: string
  name: string
  language: string
  status: string
  quality_score: number
  created_at: string
}

const FAVORITES_KEY = 'voxar-favorite-voices'

function loadFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  } catch {
    return []
  }
}

function saveFavorites(ids: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
}

interface VoiceState {
  voices: CatalogVoice[]
  clonedVoices: ClonedVoice[]
  isLoading: boolean
  error: string | null

  // Filtering
  searchQuery: string
  filters: {
    tags: string[]
  }

  // Favorites
  favorites: string[]

  // Private state
  _previewAudio?: HTMLAudioElement | null

  // Actions
  fetchVoices: () => Promise<void>
  fetchClonedVoices: () => Promise<void>
  setSearchQuery: (query: string) => void
  toggleTagFilter: (tag: string) => void
  playPreview: (id: string) => void
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  voices: [],
  clonedVoices: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  filters: {
    tags: []
  },

  favorites: loadFavorites(),

  // Reusable audio element for previews
  _previewAudio: null as HTMLAudioElement | null,

  fetchVoices: async () => {
    // Skip if already loaded (cache until page reload)
    if (get().voices.length > 0) return
    set({ isLoading: true, error: null })
    try {
      const data = await api.backendGet<{ voices: CatalogVoice[] } | CatalogVoice[]>('/api/v1/voices/catalog')
      const voices = Array.isArray(data) ? data : (data.voices || [])
      set({ voices, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch voices', isLoading: false })
    }
  },

  fetchClonedVoices: async () => {
    try {
      const data = await api.backendGet<{ voices: ClonedVoice[] }>('/api/v1/voices/my')
      set({ clonedVoices: data.voices || [] })
    } catch {
      // Silently fail for cloned voices
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleTagFilter: (tag) => set((state) => {
    const tags = state.filters.tags.includes(tag)
      ? state.filters.tags.filter(t => t !== tag)
      : [...state.filters.tags, tag]
    return { filters: { ...state.filters, tags } }
  }),

  playPreview: (id) => {
    const { voices } = get()
    const voice = voices.find(v => v.id === id)

    // Use static preview URL if available (no credit cost, instant playback)
    const previewUrl = voice?.preview_urls?.default || voice?.preview_urls?.en
    if (previewUrl) {
      let audio = get()._previewAudio
      if (!audio) {
        audio = new Audio()
        set({ _previewAudio: audio } as any)
      }
      audio.src = previewUrl
      audio.play().catch(() => {})
      return
    }

    // Fallback: generate via TTS (only if no static preview exists)
    const previewText = 'Welcome to VOXAR. This is a preview of this voice.'
    api.backendPost<{ job_id: string }>('/api/v1/generate', {
      text: previewText,
      voice_id: id,
      engine_mode: 'flash',
      language: 'en',
      output_format: 'mp3',
    }).then(async result => {
      const jobId = result.job_id
      if (!jobId) return

      while (true) {
        const job = await api.backendGet<any>(`/api/v1/jobs/${jobId}?t=${Date.now()}`)
        if (job.status === 'completed') break
        if (job.status === 'failed') throw new Error('Preview failed')
        await new Promise(r => setTimeout(r, 2000))
      }

      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      let audio = get()._previewAudio
      if (!audio) {
        audio = new Audio()
        set({ _previewAudio: audio } as any)
      }
      audio.src = `${baseUrl}/api/v1/jobs/${jobId}/audio`
      audio.play().catch(() => {})
    }).catch(err => {
      console.warn('Voice preview failed:', err.message)
    })
  },

  toggleFavorite: (id) => {
    const { favorites } = get()
    const next = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id]
    saveFavorites(next)
    set({ favorites: next })
  },

  isFavorite: (id) => {
    return get().favorites.includes(id)
  },
}))
