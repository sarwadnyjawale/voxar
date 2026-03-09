import { create } from 'zustand'
import { api } from '../lib/api'
import type { TranscriptionResult } from '../lib/types'

interface STTState {
  file: File | null
  isUploading: boolean
  isTranscribing: boolean
  progress: number
  jobId: string | null
  result: TranscriptionResult | null
  error: string | null

  // Options
  diarizationEnabled: boolean
  language: string

  // Actions
  setFile: (file: File | null) => void
  setOptions: (options: Partial<Pick<STTState, 'diarizationEnabled' | 'language'>>) => void
  startTranscription: () => Promise<void>
  reset: () => void
}

export const useSTTStore = create<STTState>((set, get) => ({
  file: null,
  isUploading: false,
  isTranscribing: false,
  progress: 0,
  jobId: null,
  result: null,
  error: null,

  diarizationEnabled: true,
  language: 'auto',

  setFile: (file) => set({ file, result: null, error: null, progress: 0 }),

  setOptions: (options) => set((state) => ({ ...state, ...options })),

  startTranscription: async () => {
    const { file, diarizationEnabled, language } = get()
    if (!file) return

    set({ isUploading: true, error: null, progress: 10 })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', language)
      formData.append('diarize', String(diarizationEnabled))
      formData.append('word_timestamps', 'true')

      set({ progress: 30 })

      // Use sync endpoint for simplicity (blocks until done)
      const result = await api.upload<{
        text: string
        language: string
        segments: Array<{ start: number; end: number; text: string; speaker?: string }>
        speakers?: Array<{ id: string; label: string; color: string }>
      }>('/api/v1/transcribe/sync', formData)

      set({
        isUploading: false,
        isTranscribing: false,
        progress: 100,
        result: {
          text: result.text,
          language: result.language,
          segments: result.segments || [],
          speakers: result.speakers,
        }
      })
    } catch (err: any) {
      set({ error: err.message || 'Transcription failed', isUploading: false, isTranscribing: false })
    }
  },

  reset: () => set({
    file: null,
    isUploading: false,
    isTranscribing: false,
    progress: 0,
    jobId: null,
    result: null,
    error: null
  }),
}))
