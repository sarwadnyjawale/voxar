"use client";

import Link from "next/link";
import { Mic, AudioLines, Dna, Library, Play, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUsageStore } from "@/stores";

const quickActions = [
  {
    label: "Text to Speech",
    desc: "Generate natural voice from text",
    href: "/dashboard/tts",
    icon: Mic,
  },
  {
    label: "Transcribe",
    desc: "Convert audio to text",
    href: "/dashboard/transcribe",
    icon: AudioLines,
  },
  {
    label: "Clone Voice",
    desc: "Create your own voice clone",
    href: "/dashboard/voices/clone",
    icon: Dna,
  },
  {
    label: "Voice Library",
    desc: "Browse 20+ neural voices",
    href: "/dashboard/voices",
    icon: Library,
  },
];

const recentActivity = [
  { id: "job_001", type: "TTS", status: "Completed", date: "2 hours ago", preview: "Welcome to today's episode of..." },
  { id: "job_002", type: "STT", status: "Completed", date: "5 hours ago", preview: "interview_recording.mp3" },
  { id: "job_003", type: "TTS", status: "Completed", date: "1 day ago", preview: "Product launch announcement..." },
  { id: "job_004", type: "TTS", status: "Failed", date: "1 day ago", preview: "Script draft v2..." },
  { id: "job_005", type: "STT", status: "Completed", date: "2 days ago", preview: "podcast_ep12.wav" },
];

export default function DashboardPage() {
  const {
    ttsMinutesUsed, ttsMinutesLimit,
    sttMinutesUsed, sttMinutesLimit,
    voiceClonesUsed, voiceClonesLimit,
    plan,
  } = useUsageStore();

  const ttsPercent = (ttsMinutesUsed / ttsMinutesLimit) * 100;
  const sttPercent = (sttMinutesUsed / sttMinutesLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-semibold text-voxar-text">Welcome back</h1>
        <p className="mt-1 text-sm text-voxar-text-muted">
          What would you like to create today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group rounded-xl border border-voxar-border/50 bg-voxar-surface p-4 transition-all hover:border-voxar-violet/30 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-voxar-violet/10 text-voxar-violet transition-colors group-hover:bg-voxar-violet/15">
              <action.icon size={18} />
            </div>
            <p className="mt-3 text-sm font-medium text-voxar-text">{action.label}</p>
            <p className="mt-0.5 text-xs text-voxar-text-muted">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Usage Overview */}
      <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-voxar-text">Usage</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-voxar-text-muted capitalize">
              {plan} plan
            </span>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-7 text-[10px] border-voxar-violet/50 text-voxar-violet hover:bg-voxar-violet/10"
            >
              <Link href="/pricing">Upgrade</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-voxar-text-secondary">Text-to-Speech</span>
              <span className={ttsPercent >= 80 ? "text-voxar-warning" : "text-voxar-text-muted"}>
                {ttsMinutesUsed} / {ttsMinutesLimit} min
              </span>
            </div>
            <Progress value={ttsPercent} className="mt-2 h-1.5" />
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-voxar-text-secondary">Transcription</span>
              <span className={sttPercent >= 80 ? "text-voxar-warning" : "text-voxar-text-muted"}>
                {sttMinutesUsed} / {sttMinutesLimit} min
              </span>
            </div>
            <Progress value={sttPercent} className="mt-2 h-1.5" />
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-voxar-text-secondary">Voice Clones</span>
              <span className="text-voxar-text-muted">
                {voiceClonesUsed} / {voiceClonesLimit}
              </span>
            </div>
            <Progress value={(voiceClonesUsed / voiceClonesLimit) * 100} className="mt-2 h-1.5" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-voxar-text">Recent Activity</h3>
          <Link
            href="/dashboard/history"
            className="flex items-center gap-1 text-xs text-voxar-violet hover:text-voxar-violet-glow"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-voxar-border/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-voxar-border/30 bg-voxar-surface">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-voxar-text-muted">Job</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-voxar-text-muted">Type</th>
                <th className="hidden px-4 py-2.5 text-left text-[11px] font-medium text-voxar-text-muted sm:table-cell">Preview</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-voxar-text-muted">Status</th>
                <th className="hidden px-4 py-2.5 text-left text-[11px] font-medium text-voxar-text-muted md:table-cell">Date</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-voxar-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((job) => (
                <tr key={job.id} className="border-b border-voxar-border/20 last:border-0 hover:bg-voxar-surface/50 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono text-voxar-text-muted">{job.id}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium ${
                      job.type === "TTS"
                        ? "bg-voxar-violet/10 text-voxar-violet"
                        : "bg-voxar-cyan/10 text-voxar-cyan"
                    }`}>
                      {job.type}
                    </span>
                  </td>
                  <td className="hidden max-w-[200px] truncate px-4 py-2.5 text-xs text-voxar-text-secondary sm:table-cell">
                    {job.preview}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs ${job.status === "Completed" ? "text-voxar-success" : "text-voxar-error"}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-2.5 text-xs text-voxar-text-muted md:table-cell">{job.date}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded p-1 text-voxar-text-muted hover:bg-voxar-surface-hover hover:text-voxar-text">
                        <Play size={13} />
                      </button>
                      <button className="rounded p-1 text-voxar-text-muted hover:bg-voxar-surface-hover hover:text-voxar-text">
                        <Download size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
