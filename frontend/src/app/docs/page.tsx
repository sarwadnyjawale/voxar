import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation - VOXAR",
  description: "VOXAR API reference for Text-to-Speech, Speech-to-Text, and Voice Cloning endpoints.",
};

const endpoints = [
  {
    group: "Text-to-Speech",
    color: "bg-voxar-violet/10 text-voxar-violet",
    items: [
      { method: "POST", path: "/api/v1/generate", desc: "Submit async TTS job" },
      { method: "POST", path: "/api/v1/generate/sync", desc: "Sync TTS (short text, <500 chars)" },
      { method: "GET", path: "/api/v1/jobs/{job_id}", desc: "Poll job status" },
      { method: "GET", path: "/api/v1/jobs/{job_id}/audio", desc: "Download generated audio" },
    ],
  },
  {
    group: "Speech-to-Text",
    color: "bg-voxar-cyan/10 text-voxar-cyan",
    items: [
      { method: "POST", path: "/api/v1/transcribe", desc: "Submit async STT job" },
      { method: "POST", path: "/api/v1/transcribe/sync", desc: "Sync STT (short audio, <30s)" },
      { method: "GET", path: "/api/v1/transcribe/{job_id}", desc: "Poll job status" },
      { method: "GET", path: "/api/v1/transcribe/{job_id}/result", desc: "Download result (JSON/SRT/VTT)" },
    ],
  },
  {
    group: "Voices",
    color: "bg-emerald-500/10 text-emerald-400",
    items: [
      { method: "GET", path: "/api/v1/voices", desc: "List/filter voice library" },
      { method: "GET", path: "/api/v1/voices/{voice_id}", desc: "Get voice details" },
      { method: "POST", path: "/api/v1/voices/clone", desc: "Upload & clone a voice" },
      { method: "GET", path: "/api/v1/voices/clone", desc: "List user's cloned voices" },
      { method: "DELETE", path: "/api/v1/voices/clone/{voice_id}", desc: "Delete cloned voice" },
    ],
  },
  {
    group: "System",
    color: "bg-amber-500/10 text-amber-400",
    items: [
      { method: "GET", path: "/api/v1/health", desc: "Server health + queue status" },
    ],
  },
];

const codeExamples = {
  python: `import requests

API_KEY = "vx_live_your_api_key"
BASE_URL = "https://api.voxar.ai"

# Generate speech
response = requests.post(
    f"{BASE_URL}/api/v1/generate",
    headers={"X-API-Key": API_KEY},
    json={
        "text": "Hello, welcome to VOXAR.",
        "voice_id": "aisha",
        "language": "en",
        "mode": "cinematic",
        "output_format": "mp3"
    }
)

job = response.json()
print(f"Job ID: {job['job_id']}")`,

  javascript: `const API_KEY = "vx_live_your_api_key";
const BASE_URL = "https://api.voxar.ai";

// Generate speech
const response = await fetch(\`\${BASE_URL}/api/v1/generate\`, {
  method: "POST",
  headers: {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "Hello, welcome to VOXAR.",
    voice_id: "aisha",
    language: "en",
    mode: "cinematic",
    output_format: "mp3",
  }),
});

const job = await response.json();
console.log(\`Job ID: \${job.job_id}\`);`,

  curl: `curl -X POST https://api.voxar.ai/api/v1/generate \\
  -H "X-API-Key: vx_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello, welcome to VOXAR.",
    "voice_id": "aisha",
    "language": "en",
    "mode": "cinematic",
    "output_format": "mp3"
  }'`,
};

export default function DocsPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-16">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-voxar-text">
              API Documentation
            </h1>
            <p className="mt-3 text-lg text-voxar-text-secondary">
              Integrate VOXAR&apos;s AI voice capabilities into your applications.
            </p>
            <div className="mt-4 rounded-lg border border-voxar-warning/30 bg-voxar-warning/5 px-4 py-3">
              <p className="text-sm text-voxar-warning">
                API access requires the Pro plan (₹4,999/month). Rate limit: 30
                requests/min, 5 concurrent jobs.
              </p>
            </div>
          </div>

          {/* Authentication */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-voxar-text mb-4">
              Authentication
            </h2>
            <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
              <p className="text-sm text-voxar-text-secondary mb-3">
                All API requests require an API key passed in the{" "}
                <code className="rounded bg-voxar-bg px-1.5 py-0.5 font-mono text-xs text-voxar-violet">
                  X-API-Key
                </code>{" "}
                header.
              </p>
              <div className="rounded-lg bg-voxar-bg p-4 font-mono text-xs text-voxar-text-secondary">
                <span className="text-voxar-cyan">X-API-Key</span>:{" "}
                <span className="text-voxar-violet-glow">vx_live_your_api_key</span>
              </div>
            </div>
          </section>

          {/* Base URL */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-voxar-text mb-4">
              Base URL
            </h2>
            <div className="rounded-lg bg-voxar-surface border border-voxar-border/50 p-4 font-mono text-sm text-voxar-violet">
              https://api.voxar.ai
            </div>
          </section>

          {/* Endpoints */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-voxar-text mb-6">
              Endpoints
            </h2>
            <div className="space-y-8">
              {endpoints.map((group) => (
                <div key={group.group}>
                  <h3 className="text-lg font-medium text-voxar-text mb-3">
                    {group.group}
                  </h3>
                  <div className="space-y-2">
                    {group.items.map((ep) => (
                      <div
                        key={ep.path}
                        className="flex items-center gap-3 rounded-lg border border-voxar-border/30 bg-voxar-surface p-3"
                      >
                        <Badge
                          className={`font-mono text-[10px] border-0 ${
                            ep.method === "GET"
                              ? "bg-voxar-success/10 text-voxar-success"
                              : ep.method === "POST"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-voxar-error/10 text-voxar-error"
                          }`}
                        >
                          {ep.method}
                        </Badge>
                        <code className="font-mono text-xs text-voxar-text">
                          {ep.path}
                        </code>
                        <span className="ml-auto text-xs text-voxar-text-muted">
                          {ep.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Code Examples */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-voxar-text mb-6">
              Quick Start
            </h2>
            <div className="space-y-4">
              {Object.entries(codeExamples).map(([lang, code]) => (
                <div key={lang}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-voxar-text-secondary uppercase">
                      {lang}
                    </span>
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-voxar-border/50 bg-voxar-surface p-4 font-mono text-xs text-voxar-text-secondary">
                    {code}
                  </pre>
                </div>
              ))}
            </div>
          </section>

          {/* Rate Limits */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-voxar-text mb-4">
              Rate Limits
            </h2>
            <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
              <div className="space-y-2 text-sm">
                {[
                  ["Pro Plan", "30 requests/min, 5 concurrent jobs"],
                  ["Enterprise", "Custom limits (SLA-backed)"],
                  ["Burst Protection", "429 Too Many Requests with Retry-After header"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-voxar-text-secondary">{label}</span>
                    <span className="text-voxar-text-muted">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
