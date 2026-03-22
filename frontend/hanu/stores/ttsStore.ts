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
  setUsageRefresh: (fn: (() => Promise<void>) | null) => void
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

  _usageRefresh: null as (() => Promise<void>) | null,

  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),

  setUsageRefresh: (fn) => set({ _usageRefresh: fn } as any),

  generateAudio: async () => {
    const state = get()
    if (!state.text.trim()) return

    set({ isGenerating: true, error: null, showPlayer: false })

    try {
      const result = await api.backendPost<{
        id: string
        job_id?: string
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
        speed: state.speed,
      })

      const jobId = result.job_id || result.id
      
      let finalJob: any = null
      while (true) {
        const job = await api.backendGet<any>(`/api/v1/jobs/${jobId}?t=${Date.now()}`)
        if (job.status === 'completed') {
          finalJob = job
          break
        }
        if (job.status === 'failed') {
          throw new Error(job.error || 'Engine job failed')
        }
        await new Promise(r => setTimeout(r, 2000))
      }

      const dur = finalJob.duration || result.duration || 0
      const mins = Math.floor(dur / 60)
      const secs = Math.round(dur % 60)

      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const audioUrl = `${baseUrl}/api/v1/jobs/${jobId}/audio`

      set({
        isGenerating: false,
        showPlayer: true,
        audioUrl,
        duration: `${mins}:${secs.toString().padStart(2, '0')}`,
        minutesUsed: result.minutes_used,
      })

      // Refresh sidebar usage after successful generation
      const refresh = (get() as any)._usageRefresh
      if (refresh) refresh()
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
