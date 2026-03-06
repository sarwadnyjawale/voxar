import { create } from "zustand";

// Auth Store
interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    plan: string;
    avatar?: string;
  } | null;
  apiKey: string | null;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
  setApiKey: (key: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  apiKey:
    typeof window !== "undefined"
      ? localStorage.getItem("voxar_api_key")
      : null,
  login: (_email: string, _password: string) => {
    // Phase 9 will implement real auth via Node.js backend
    // For now, use API key auth directly
    const demoUser = {
      name: "Demo User",
      email: _email,
      plan: "starter",
    };
    set({ isAuthenticated: true, user: demoUser });
  },
  signup: (_name: string, _email: string, _password: string) => {
    const demoUser = {
      name: _name,
      email: _email,
      plan: "free",
    };
    set({ isAuthenticated: true, user: demoUser });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("voxar_api_key");
    }
    set({ isAuthenticated: false, user: null, apiKey: null });
  },
  setApiKey: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("voxar_api_key", key);
    }
    set({ apiKey: key });
  },
}));

// Usage Store
interface UsageState {
  ttsMinutesUsed: number;
  ttsMinutesLimit: number;
  sttMinutesUsed: number;
  sttMinutesLimit: number;
  voiceClonesUsed: number;
  voiceClonesLimit: number;
  plan: string;
  resetDate: string;
  fetchUsage: () => void;
}

export const useUsageStore = create<UsageState>((set) => ({
  ttsMinutesUsed: 8.4,
  ttsMinutesLimit: 10,
  sttMinutesUsed: 12,
  sttMinutesLimit: 15,
  voiceClonesUsed: 1,
  voiceClonesLimit: 1,
  plan: "access",
  resetDate: "2026-03-18",
  fetchUsage: () => {
    // Phase 9: fetch from Node.js backend
    set({
      ttsMinutesUsed: 8.4,
      ttsMinutesLimit: 10,
      sttMinutesUsed: 12,
      sttMinutesLimit: 15,
    });
  },
}));

// TTS Store
interface TTSJob {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  status: "queued" | "processing" | "completed" | "failed";
  audioUrl?: string;
  duration?: number;
  qualityScore?: number;
  processingTime?: number;
  engine?: string;
  characters?: number;
  createdAt: string;
}

interface TTSState {
  text: string;
  selectedVoice: string | null;
  language: string;
  mode: string;
  speed: number;
  outputFormat: string;
  currentJob: TTSJob | null;
  recentJobs: TTSJob[];
  isGenerating: boolean;
  setText: (text: string) => void;
  setVoice: (voiceId: string) => void;
  setLanguage: (lang: string) => void;
  setMode: (mode: string) => void;
  setSpeed: (speed: number) => void;
  setOutputFormat: (format: string) => void;
  setGenerating: (generating: boolean) => void;
  setCurrentJob: (job: TTSJob | null) => void;
  addRecentJob: (job: TTSJob) => void;
}

export const useTTSStore = create<TTSState>((set) => ({
  text: "",
  selectedVoice: null,
  language: "auto",
  mode: "flash",
  speed: 1.0,
  outputFormat: "mp3",
  currentJob: null,
  recentJobs: [],
  isGenerating: false,
  setText: (text) => set({ text }),
  setVoice: (voiceId) => set({ selectedVoice: voiceId }),
  setLanguage: (lang) => set({ language: lang }),
  setMode: (mode) => set({ mode }),
  setSpeed: (speed) => set({ speed }),
  setOutputFormat: (format) => set({ outputFormat: format }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setCurrentJob: (job) => set({ currentJob: job }),
  addRecentJob: (job) =>
    set((state) => ({
      recentJobs: [job, ...state.recentJobs].slice(0, 10),
    })),
}));

// STT Store
interface STTSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  words?: Array<{ word: string; start: number; end: number }>;
}

interface STTJob {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  fileName: string;
  text?: string;
  language?: string;
  languageConfidence?: number;
  segments?: STTSegment[];
  duration?: number;
  wordCount?: number;
  speakerCount?: number;
  createdAt: string;
}

interface STTState {
  currentJob: STTJob | null;
  recentJobs: STTJob[];
  isTranscribing: boolean;
  task: "transcribe" | "translate";
  language: string;
  diarization: boolean;
  speakerCount: string;
  subtitleFormat: string;
  wordTimestamps: boolean;
  setCurrentJob: (job: STTJob | null) => void;
  addRecentJob: (job: STTJob) => void;
  setTranscribing: (transcribing: boolean) => void;
  setTask: (task: "transcribe" | "translate") => void;
  setLanguage: (lang: string) => void;
  setDiarization: (enabled: boolean) => void;
  setSpeakerCount: (count: string) => void;
  setSubtitleFormat: (format: string) => void;
  setWordTimestamps: (enabled: boolean) => void;
}

export const useSTTStore = create<STTState>((set) => ({
  currentJob: null,
  recentJobs: [],
  isTranscribing: false,
  task: "transcribe",
  language: "auto",
  diarization: false,
  speakerCount: "auto",
  subtitleFormat: "srt",
  wordTimestamps: false,
  setCurrentJob: (job) => set({ currentJob: job }),
  addRecentJob: (job) =>
    set((state) => ({
      recentJobs: [job, ...state.recentJobs].slice(0, 10),
    })),
  setTranscribing: (transcribing) => set({ isTranscribing: transcribing }),
  setTask: (task) => set({ task }),
  setLanguage: (lang) => set({ language: lang }),
  setDiarization: (enabled) => set({ diarization: enabled }),
  setSpeakerCount: (count) => set({ speakerCount: count }),
  setSubtitleFormat: (format) => set({ subtitleFormat: format }),
  setWordTimestamps: (enabled) => set({ wordTimestamps: enabled }),
}));

// Voice Store
interface Voice {
  id: string;
  name: string;
  gender: string;
  languages: string[];
  styles: string[];
  previewUrl?: string;
  isCloned?: boolean;
}

interface VoiceState {
  voices: Voice[];
  clonedVoices: Voice[];
  favorites: string[];
  setVoices: (voices: Voice[]) => void;
  setClonedVoices: (voices: Voice[]) => void;
  toggleFavorite: (voiceId: string) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  voices: [],
  clonedVoices: [],
  favorites: [],
  setVoices: (voices) => set({ voices }),
  setClonedVoices: (voices) => set({ clonedVoices: voices }),
  toggleFavorite: (voiceId) =>
    set((state) => ({
      favorites: state.favorites.includes(voiceId)
        ? state.favorites.filter((id) => id !== voiceId)
        : [...state.favorites, voiceId],
    })),
}));
