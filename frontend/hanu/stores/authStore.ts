import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../lib/types'
import { api } from '../lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  fetchMe: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = await api.backendPost<{ user: User; token: string }>('/api/v1/auth/login', { email, password })
          if (typeof window !== 'undefined') {
            localStorage.setItem('voxar-token', data.token)
          }
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
        } catch (err: any) {
          set({ error: err.message || 'Login failed', isLoading: false })
          throw err
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = await api.backendPost<{ user: User; token: string }>('/api/v1/auth/register', { name, email, password })
          if (typeof window !== 'undefined') {
            localStorage.setItem('voxar-token', data.token)
          }
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
        } catch (err: any) {
          set({ error: err.message || 'Registration failed', isLoading: false })
          throw err
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('voxar-token')
        }
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),

      fetchMe: async () => {
        try {
          const data = await api.backendGet<{ user: User }>('/api/v1/auth/me')
          set({ user: data.user, isAuthenticated: true })
        } catch {
          // Token expired or invalid — log out
          get().logout()
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'voxar-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
