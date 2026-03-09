import { create } from 'zustand'
import { api } from '../lib/api'
import type { Usage } from '../lib/types'

interface UsageState {
  usage: Usage | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchUsage: () => Promise<void>
}

export const useUsageStore = create<UsageState>((set) => ({
  usage: null,
  isLoading: false,
  error: null,

  fetchUsage: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.backendGet<Usage>('/api/v1/user/usage')
      set({ usage: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch usage', isLoading: false })
    }
  },
}))
