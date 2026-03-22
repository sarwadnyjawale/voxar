import { create } from 'zustand'

const THEME_KEY = 'voxar-theme'

interface ThemeState {
  isLight: boolean
  toggleTheme: () => void
  initTheme: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isLight: false,

  toggleTheme: () => {
    const next = !get().isLight
    document.body.classList.toggle('light-mode', next)
    localStorage.setItem(THEME_KEY, next ? 'light' : 'dark')
    set({ isLight: next })
  },

  initTheme: () => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(THEME_KEY)
    const isLight = saved === 'light'
    document.body.classList.toggle('light-mode', isLight)
    set({ isLight })
  },
}))
