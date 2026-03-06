const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  isFormData?: boolean;
};

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, isFormData = false } = options;

  const apiKey =
    typeof window !== "undefined" ? localStorage.getItem("voxar_api_key") : null;

  const config: RequestInit = {
    method,
    headers: {
      ...(apiKey ? { "X-API-Key": apiKey } : {}),
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response as unknown as T;
}

// TTS API
export const ttsApi = {
  generate: (data: {
    text: string;
    voice_id: string;
    language?: string;
    mode?: string;
    speed?: number;
    output_format?: string;
  }) => request<{ job_id: string }>("/api/v1/generate", { method: "POST", body: data }),

  generateSync: (data: {
    text: string;
    voice_id: string;
    language?: string;
    mode?: string;
    speed?: number;
    output_format?: string;
  }) => request<Response>("/api/v1/generate/sync", { method: "POST", body: data }),

  getJobStatus: (jobId: string) =>
    request<{
      job_id: string;
      status: string;
      progress?: number;
      result?: { audio_path: string; duration: number; quality_score: number };
      error?: string;
    }>(`/api/v1/jobs/${jobId}`),

  getAudio: (jobId: string) =>
    fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/audio`, {
      headers: {
        "X-API-Key": localStorage.getItem("voxar_api_key") || "",
      },
    }),
};

// STT API
export const sttApi = {
  transcribe: (formData: FormData) =>
    request<{ job_id: string }>("/api/v1/transcribe", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),

  transcribeSync: (formData: FormData) =>
    request<{
      text: string;
      language: string;
      segments: Array<{
        start: number;
        end: number;
        text: string;
        speaker?: string;
      }>;
    }>("/api/v1/transcribe/sync", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),

  getJobStatus: (jobId: string) =>
    request<{
      job_id: string;
      status: string;
      progress?: number;
      result?: {
        text: string;
        language: string;
        segments: Array<{
          start: number;
          end: number;
          text: string;
          speaker?: string;
          words?: Array<{ word: string; start: number; end: number }>;
        }>;
        duration: number;
      };
      error?: string;
    }>(`/api/v1/transcribe/${jobId}`),

  getResult: (jobId: string, format?: string) =>
    fetch(
      `${API_BASE_URL}/api/v1/transcribe/${jobId}/result${format ? `?format=${format}` : ""}`,
      {
        headers: {
          "X-API-Key": localStorage.getItem("voxar_api_key") || "",
        },
      }
    ),
};

// Voices API
export const voicesApi = {
  list: (params?: { language?: string; gender?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.language) searchParams.set("language", params.language);
    if (params?.gender) searchParams.set("gender", params.gender);
    const query = searchParams.toString();
    return request<{
      voices: Array<{
        id: string;
        name: string;
        gender: string;
        languages: string[];
        styles: string[];
        preview_url?: string;
      }>;
    }>(`/api/v1/voices${query ? `?${query}` : ""}`);
  },

  get: (voiceId: string) =>
    request<{
      id: string;
      name: string;
      gender: string;
      languages: string[];
      styles: string[];
      preview_url?: string;
    }>(`/api/v1/voices/${voiceId}`),

  clone: (formData: FormData) =>
    request<{
      voice_id: string;
      name: string;
      quality_score: number;
    }>("/api/v1/voices/clone", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),

  listCloned: () =>
    request<{
      voices: Array<{
        id: string;
        name: string;
        created_at: string;
      }>;
    }>("/api/v1/voices/clone"),

  deleteCloned: (voiceId: string) =>
    request<{ success: boolean }>(`/api/v1/voices/clone/${voiceId}`, {
      method: "DELETE",
    }),
};

// Health API
export const healthApi = {
  check: () =>
    request<{
      status: string;
      gpu_available: boolean;
      queue_size: number;
      active_jobs: number;
    }>("/api/v1/health"),
};
