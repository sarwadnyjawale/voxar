import type { ApiError } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || ''

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('voxar-token')
}

function buildHeaders(extra?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // Auto-logout on 401 (expired/invalid token)
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('voxar-token')
        // Dynamic import to avoid circular dependencies
        const { useAuthStore } = await import('@/stores/authStore')
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    const error: ApiError = {
      status: res.status,
      message: res.statusText,
    }

    try {
      const body = await res.json()
      let msg = body.detail || body.message || res.statusText
      if (typeof msg === 'object') {
        msg = JSON.stringify(msg)
      }
      error.message = msg
      error.detail = body.detail
    } catch {}

    throw error
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

export const api = {
  // ---------- FastAPI AI Engine (Python :8000) ----------

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: buildHeaders(),
    })
    return handleResponse<T>(res)
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(res)
  },

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: formData,
    })
    return handleResponse<T>(res)
  },

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    })
    return handleResponse<T>(res)
  },

  // ---------- Node.js Backend (:3001) ----------

  async backendGet<T>(path: string): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'GET',
      headers: buildHeaders(),
      cache: 'no-store',
    })
    return handleResponse<T>(res)
  },

  async backendPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(res)
  },

  async backendPatch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(res)
  },

  async backendDelete<T>(path: string): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    })
    return handleResponse<T>(res)
  },

  async backendUpload<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: formData,
    })
    return handleResponse<T>(res)
  },
}
