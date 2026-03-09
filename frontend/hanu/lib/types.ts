// Shared TypeScript interfaces for the Voxar frontend

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: 'free' | 'access' | 'starter' | 'creator' | 'pro' | 'enterprise'
  createdAt: string
}

export interface Voice {
  id: string
  name: string
  display_name: string
  gender: 'male' | 'female'
  languages: string[]
  primary_language: string
  accent: string
  styles: string[]
  description: string
  tags: string[]
  pitch: string
  energy: string
  warmth: string
  embedding_path: string
  preview_urls: Record<string, string>
  is_premium: boolean
  quality_score: number
  usage_count: number
  created_at: string
}

export interface TTSJob {
  id: string
  text: string
  voice: string
  engine: string
  language: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  duration?: number
  audio_url?: string
  created_at: string
  format: string
}

export interface STTJob {
  id: string
  filename: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  transcription?: TranscriptionResult
  created_at: string
}

export interface TranscriptionResult {
  text: string
  language: string
  segments: TranscriptionSegment[]
  speakers?: Speaker[]
}

export interface TranscriptionSegment {
  start: number
  end: number
  text: string
  speaker?: string
  words?: { word: string; start: number; end: number }[]
}

export interface Speaker {
  id: string
  label: string
  color: string
}

export interface Usage {
  tts_minutes_used: number
  tts_minutes_total: number
  stt_minutes_used: number
  stt_minutes_total: number
  clones_used: number
  clones_total: number
  plan: string
}

export interface ApiError {
  status: number
  message: string
  detail?: string
}
