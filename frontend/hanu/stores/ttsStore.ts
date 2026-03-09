import { create } from 'zustand'
import { api } from '../lib/api'

interface TTSState {
  text: string
  voice: string
  engine: string
  stability: number
  speed: number
  format: string
  language: string
  enhance: boolean
  normalize: boolean

  // Generation state
  isGenerating: boolean
  error: string | null

  // Player state
  showPlayer: boolean
  audioUrl: string | null
  duration: string | null
  minutesUsed: number | null

  // Actions
  updateSettings: (settings: Partial<TTSState>) => void
  generateAudio: () => Promise<void>
  setPlayerState: (show: boolean, url?: string, duration?: string) => void
}

export const useTTSStore = create<TTSState>((set, get) => ({
  text: '',
  voice: 'v011',
  engine: 'flash',
  stability: 0.75,
  speed: 1.0,
  format: 'mp3',
  language: 'hi',
  enhance: false,
  normalize: true,

  isGenerating: false,
  error: null,

  showPlayer: false,
  audioUrl: null,
  duration: null,
  minutesUsed: null,

  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),

  generateAudio: async () => {
    const state = get()
    if (!state.text.trim()) return

    set({ isGenerating: true, error: null, showPlayer: false })

    try {
      const result = await api.backendPost<{
        id: string
        audio_url: string
        duration: number
        characters: number
        minutes_used: number
        format: string
      }>('/api/v1/tts/generate', {
        text: state.text.trim(),
        voice: state.voice,
        engine: state.engine,
        language: state.language,
        format: state.format,
        enhance: state.enhance,
        normalize: state.normalize,
      })

      const mins = Math.floor(result.duration / 60)
      const secs = Math.round(result.duration % 60)

      set({
        isGenerating: false,
        showPlayer: true,
        audioUrl: result.audio_url,
        duration: `${mins}:${secs.toString().padStart(2, '0')}`,
        minutesUsed: result.minutes_used,
      })
    } catch (err: any) {
      set({ error: err.message || 'Generation failed', isGenerating: false })
    }
  },

  setPlayerState: (show, url, duration) => set({
    showPlayer: show,
    ...(url !== undefined && { audioUrl: url }),
    ...(duration !== undefined && { duration })
  }),
}))
