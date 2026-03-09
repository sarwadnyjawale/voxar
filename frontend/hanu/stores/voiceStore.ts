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

  // Actions
  fetchVoices: () => Promise<void>
  fetchClonedVoices: () => Promise<void>
  setSearchQuery: (query: string) => void
  toggleTagFilter: (tag: string) => void
  playPreview: (id: string) => void
}

export const useVoiceStore = create<VoiceState>((set) => ({
  voices: [],
  clonedVoices: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  filters: {
    tags: []
  },

  fetchVoices: async () => {
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
    // Generate a short TTS preview via the backend
    const previewText = 'Welcome to VOXAR. This is a preview of this voice.'
    api.backendPost<{ audio_url: string }>('/api/v1/tts/generate', {
      text: previewText,
      voice: id,
      engine: 'flash',
      language: 'en',
      format: 'mp3',
    }).then(result => {
      if (result.audio_url) {
        const audio = new Audio(result.audio_url)
        audio.play().catch(() => {})
      }
    }).catch(err => {
      console.warn('Voice preview failed:', err.message)
    })
  },
}))
