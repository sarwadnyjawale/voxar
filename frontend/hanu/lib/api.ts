import type { ApiError } from './types'

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

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
    const error: ApiError = {
      status: res.status,
      message: res.statusText,
    }
    try {
      const body = await res.json()
      error.message = body.detail || body.message || res.statusText
      error.detail = body.detail
    } catch {
      // ignore parse errors
    }
    throw error
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// --- Core request methods ---

export const api = {
  // ─── FastAPI AI Engine calls have been removed ───

  /** GET request to the Node.js business backend */
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'GET',
      headers: buildHeaders(),
    })
    return handleResponse<T>(res)
  },

  /** POST request to the Node.js business backend */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(res)
  },

  /** Upload file to the Node.js business backend */
  async upload<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: formData,
    })
    return handleResponse<T>(res)
  },

  /** DELETE request to the Node.js business backend */
  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    })
    return handleResponse<T>(res)
  },
}

  // ─── Node.js Business Backend (:3001) ───

  /** GET request to the Node.js business backend */
  async backendGet<T>(path: string): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'GET',
      headers: buildHeaders(),
    })
    return handleResponse<T>(res)
  },

  /** POST request to the Node.js business backend */
  async backendPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(res)
  },

  /** PATCH request to the Node.js business backend */
  async backendPatch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(res)
  },

  /** DELETE request to the Node.js business backend */
  async backendDelete<T>(path: string): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    })
    return handleResponse<T>(res)
  },

  /** Upload file to the Node.js business backend (multipart) */
  async backendUpload<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: formData,
    })
    return handleResponse<T>(res)
  },
}
