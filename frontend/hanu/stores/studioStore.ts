import { create } from 'zustand'
import { api } from '../lib/api'

export interface StudioBlock {
  id: string
  text: string
  voiceId: string
  voiceName: string
  engine: string
  language: string
  speed: number
  // Generation state
  audioUrl: string | null
  duration: number           // actual seconds from engine, 0 if not generated
  status: 'idle' | 'generating' | 'done' | 'error'
  error: string | null
  // Dirty flag: true when text/voice/settings changed after last generation
  dirty: boolean
}

interface StudioState {
  projectName: string
  blocks: StudioBlock[]
  activeBlockId: string | null
  format: string
  enhance: boolean
  normalize: boolean
  volume: number

  // Generation orchestration
  isGeneratingAll: boolean
  generatingBlockId: string | null
  generationProgress: { current: number; total: number } | null

  // Playback
  isPlaying: boolean
  currentPlayBlockIdx: number
  audioElement: HTMLAudioElement | null

  // Actions
  setProjectName: (name: string) => void
  setActiveBlock: (id: string | null) => void
  setFormat: (f: string) => void
  setEnhance: (v: boolean) => void
  setNormalize: (v: boolean) => void
  setVolume: (v: number) => void

  // Block CRUD
  addBlock: (voiceId?: string, voiceName?: string) => string
  deleteBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  updateBlockText: (id: string, text: string) => void
  updateBlockSettings: (id: string, settings: Partial<Pick<StudioBlock, 'voiceId' | 'voiceName' | 'engine' | 'language' | 'speed'>>) => void

  // Generation
  generateBlock: (id: string) => Promise<void>
  generateAll: () => Promise<void>
  stopGenerateAll: () => void

  // Playback
  playBlock: (id: string) => void
  playAll: () => void
  stopPlayback: () => void
}

let blockCounter = 0
let abortGenerateAll = false
let lastUsedVoiceId = 'v011'
let lastUsedVoiceName = 'Arjun'

function makeId(): string {
  return `sb-${++blockCounter}-${Date.now()}`
}

function createBlock(
  text = '',
  voiceId = 'v011',
  voiceName = 'Arjun',
  engine = 'flash',
  language = 'auto',
  speed = 1.0
): StudioBlock {
  return {
    id: makeId(),
    text,
    voiceId,
    voiceName,
    engine,
    language,
    speed,
    audioUrl: null,
    duration: 0,
    status: 'idle',
    error: null,
    dirty: true,
  }
}

export const useStudioStore = create<StudioState>((set, get) => ({
  projectName: 'Untitled Project',
  blocks: [
    createBlock('Welcome to VOXAR Studio. This is your advanced workspace for creating multi-voice audio productions.'),
    createBlock('Each block represents a speech segment. You can assign different voices to each block.', 'v011', 'Arjun', 'flash', 'auto', 1.0),
    createBlock('Use the timeline below to preview your entire project as a seamless audio experience.', 'v011', 'Arjun', 'flash', 'auto', 1.0),
  ],
  activeBlockId: null,
  format: 'mp3',
  enhance: false,
  normalize: true,
  volume: 80,

  isGeneratingAll: false,
  generatingBlockId: null,
  generationProgress: null,

  isPlaying: false,
  currentPlayBlockIdx: -1,
  audioElement: null,

  setProjectName: (name) => set({ projectName: name }),
  setActiveBlock: (id) => set({ activeBlockId: id }),
  setFormat: (f) => set({ format: f }),
  setEnhance: (v) => set({ enhance: v }),
  setNormalize: (v) => set({ normalize: v }),
  setVolume: (v) => {
    set({ volume: v })
    const { audioElement } = get()
    if (audioElement) audioElement.volume = v / 100
  },

  addBlock: (voiceId, voiceName) => {
    const vid = voiceId || lastUsedVoiceId
    const vname = voiceName || lastUsedVoiceName
    const block = createBlock('', vid, vname)
    set((s) => ({
      blocks: [...s.blocks, block],
      activeBlockId: block.id,
    }))
    return block.id
  },

  deleteBlock: (id) => {
    const { blocks, activeBlockId } = get()
    if (blocks.length <= 1) return
    set({
      blocks: blocks.filter((b) => b.id !== id),
      activeBlockId: activeBlockId === id ? null : activeBlockId,
    })
  },

  duplicateBlock: (id) => {
    const { blocks } = get()
    const idx = blocks.findIndex((b) => b.id === id)
    if (idx === -1) return
    const src = blocks[idx]
    const dup = createBlock(src.text, src.voiceId, src.voiceName, src.engine, src.language, src.speed)
    const next = [...blocks]
    next.splice(idx + 1, 0, dup)
    set({ blocks: next })
  },

  updateBlockText: (id, text) => {
    set((s) => ({
      blocks: s.blocks.map((b) =>
        b.id === id ? { ...b, text, dirty: true } : b
      ),
    }))
  },

  updateBlockSettings: (id, settings) => {
    if (settings.voiceId) lastUsedVoiceId = settings.voiceId
    if (settings.voiceName) lastUsedVoiceName = settings.voiceName
    set((s) => ({
      blocks: s.blocks.map((b) =>
        b.id === id ? { ...b, ...settings, dirty: true } : b
      ),
    }))
  },

  generateBlock: async (id) => {
    const { blocks, format, enhance, normalize } = get()
    const block = blocks.find((b) => b.id === id)
    if (!block || !block.text.trim()) return

    // Mark generating
    set((s) => ({
      generatingBlockId: id,
      blocks: s.blocks.map((b) =>
        b.id === id ? { ...b, status: 'generating' as const, error: null } : b
      ),
    }))

    try {
      const result = await api.backendPost<{
        id: string
        audio_url: string
        duration: number
        characters: number
        minutes_used: number
        format: string
      }>('/api/v1/tts/generate', {
        text: block.text.trim(),
        voice: block.voiceId,
        engine: block.engine,
        language: block.language,
        speed: block.speed,
        format,
        enhance,
        normalize,
      })

      set((s) => ({
        generatingBlockId: null,
        blocks: s.blocks.map((b) =>
          b.id === id
            ? {
                ...b,
                audioUrl: result.audio_url,
                duration: result.duration || 0,
                status: 'done' as const,
                error: null,
                dirty: false,
              }
            : b
        ),
      }))
    } catch (err: any) {
      set((s) => ({
        generatingBlockId: null,
        blocks: s.blocks.map((b) =>
          b.id === id
            ? { ...b, status: 'error' as const, error: err.message || 'Generation failed' }
            : b
        ),
      }))
    }
  },

  generateAll: async () => {
    const { blocks } = get()
    const pending = blocks.filter((b) => b.text.trim() && (b.dirty || b.status !== 'done'))
    if (pending.length === 0) return

    abortGenerateAll = false
    set({ isGeneratingAll: true, generationProgress: { current: 0, total: pending.length } })

    for (let i = 0; i < pending.length; i++) {
      if (abortGenerateAll) break
      set({ generationProgress: { current: i + 1, total: pending.length } })
      await get().generateBlock(pending[i].id)
    }

    set({ isGeneratingAll: false, generationProgress: null })
  },

  stopGenerateAll: () => {
    abortGenerateAll = true
  },

  playBlock: (id) => {
    const { blocks, volume } = get()
    const block = blocks.find((b) => b.id === id)
    if (!block?.audioUrl) return

    // Stop any existing playback
    get().stopPlayback()

    const audio = new Audio(block.audioUrl)
    audio.volume = volume / 100
    audio.onended = () => set({ isPlaying: false, audioElement: null, currentPlayBlockIdx: -1 })
    audio.onerror = () => set({ isPlaying: false, audioElement: null, currentPlayBlockIdx: -1 })
    audio.play().catch(() => {})

    const idx = blocks.findIndex((b) => b.id === id)
    set({ isPlaying: true, audioElement: audio, currentPlayBlockIdx: idx, activeBlockId: id })
  },

  playAll: () => {
    const { blocks, volume } = get()
    const withAudio = blocks.filter((b) => b.audioUrl)
    if (withAudio.length === 0) return

    get().stopPlayback()

    let currentIdx = 0

    function playNext() {
      if (currentIdx >= withAudio.length) {
        set({ isPlaying: false, audioElement: null, currentPlayBlockIdx: -1 })
        return
      }

      const block = withAudio[currentIdx]
      const globalIdx = blocks.findIndex((b) => b.id === block.id)
      const audio = new Audio(block.audioUrl!)
      audio.volume = volume / 100
      audio.onended = () => {
        currentIdx++
        playNext()
      }
      audio.onerror = () => {
        currentIdx++
        playNext()
      }
      audio.play().catch(() => {})
      set({ audioElement: audio, currentPlayBlockIdx: globalIdx, activeBlockId: block.id })
    }

    set({ isPlaying: true })
    playNext()
  },

  stopPlayback: () => {
    const { audioElement } = get()
    if (audioElement) {
      audioElement.pause()
      audioElement.src = ''
    }
    set({ isPlaying: false, audioElement: null, currentPlayBlockIdx: -1 })
  },
}))
