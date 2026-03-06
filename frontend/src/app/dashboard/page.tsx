"use client";

import Link from "next/link";
import { Mic, AudioLines, Dna, Library, Play, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUsageStore } from "@/stores";

const quickActions = [
  {
    label: "Generate Speech",
    href: "/dashboard/tts",
    icon: Mic,
    color: "from-voxar-violet to-purple-500",
  },
  {
    label: "Transcribe Audio",
    href: "/dashboard/transcribe",
    icon: AudioLines,
    color: "from-voxar-cyan to-blue-500",
  },
  {
    label: "Clone a Voice",
    href: "/dashboard/voices/clone",
    icon: Dna,
    color: "from-emerald-500 to-green-500",
  },
  {
    label: "Browse Voices",
    href: "/dashboard/voices",
    icon: Library,
    color: "from-amber-500 to-orange-500",
  },
];

const recentActivity = [
  {
    id: "job_001",
    type: "TTS",
    status: "Completed",
    date: "2 hours ago",
    preview: "Welcome to today's episode of...",
  },
  {
    id: "job_002",
    type: "STT",
    status: "Completed",
    date: "5 hours ago",
    preview: "interview_recording.mp3",
  },
  {
    id: "job_003",
    type: "TTS",
    status: "Completed",
    date: "1 day ago",
    preview: "Product launch announcement...",
  },
  {
    id: "job_004",
    type: "TTS",
    status: "Failed",
    date: "1 day ago",
    preview: "Script draft v2...",
  },
  {
    id: "job_005",
    type: "STT",
    status: "Completed",
    date: "2 days ago",
    preview: "podcast_ep12.wav",
  },
];

export default function DashboardPage() {
  const {
    ttsMinutesUsed,
    ttsMinutesLimit,
    sttMinutesUsed,
    sttMinutesLimit,
    voiceClonesUsed,
    voiceClonesLimit,
    plan,
  } = useUsageStore();

  const ttsPercent = (ttsMinutesUsed / ttsMinutesLimit) * 100;
  const sttPercent = (sttMinutesUsed / sttMinutesLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-voxar-text">Quick Actions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-voxar-border/50 bg-voxar-surface p-4 transition-all hover:border-voxar-violet/30 hover:shadow-lg hover:shadow-voxar-violet/5"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} opacity-80 group-hover:opacity-100 transition-opacity`}
              >
                <action.icon size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium text-voxar-text">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Usage Overview */}
      <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-voxar-text">
            Usage Overview
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-voxar-text-muted capitalize">
              Current plan: <span className="text-voxar-violet">{plan}</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-7 text-xs border-voxar-violet/50 text-voxar-violet hover:bg-voxar-violet/10"
            >
              <Link href="/pricing">Upgrade</Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {/* TTS */}
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-voxar-text-secondary">
                Text-to-Speech
              </span>
              <span
                className={
                  ttsPercent >= 80
                    ? "text-voxar-warning"
                    : "text-voxar-text-muted"
                }
              >
                {ttsMinutesUsed} / {ttsMinutesLimit} min
              </span>
            </div>
            <Progress value={ttsPercent} className="mt-2 h-2" />
          </div>

          {/* STT */}
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-voxar-text-secondary">Transcription</span>
              <span
                className={
                  sttPercent >= 80
                    ? "text-voxar-warning"
                    : "text-voxar-text-muted"
                }
              >
                {sttMinutesUsed} / {sttMinutesLimit} min
              </span>
            </div>
            <Progress value={sttPercent} className="mt-2 h-2" />
          </div>

          {/* Clones */}
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-voxar-text-secondary">Voice Clones</span>
              <span className="text-voxar-text-muted">
                {voiceClonesUsed} / {voiceClonesLimit} used
              </span>
            </div>
            <Progress
              value={(voiceClonesUsed / voiceClonesLimit) * 100}
              className="mt-2 h-2"
            />
          </div>
        </div>

        {ttsPercent >= 80 && (
          <div className="mt-4 rounded-lg bg-voxar-warning/10 border border-voxar-warning/20 px-4 py-2.5">
            <p className="text-xs text-voxar-warning">
              You&apos;re close to your monthly limit. Upgrade to Starter for
              12x more generation.
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-voxar-text">
            Recent Activity
          </h3>
          <Link
            href="/dashboard/history"
            className="text-xs text-voxar-violet hover:text-voxar-violet-glow"
          >
            View All History
          </Link>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-voxar-border/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-voxar-border/30 bg-voxar-surface">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted">
                  Job ID
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted">
                  Type
                </th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted sm:table-cell">
                  Preview
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted">
                  Status
                </th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted md:table-cell">
                  Date
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-voxar-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-voxar-border/20 last:border-0 hover:bg-voxar-surface/50"
                >
                  <td className="px-4 py-3 text-xs font-mono text-voxar-text-muted">
                    {job.id}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium ${
                        job.type === "TTS"
                          ? "bg-voxar-violet/10 text-voxar-violet"
                          : "bg-voxar-cyan/10 text-voxar-cyan"
                      }`}
                    >
                      {job.type}
                    </span>
                  </td>
                  <td className="hidden max-w-[200px] truncate px-4 py-3 text-xs text-voxar-text-secondary sm:table-cell">
                    {job.preview}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs ${
                        job.status === "Completed"
                          ? "text-voxar-success"
                          : "text-voxar-error"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-voxar-text-muted md:table-cell">
                    {job.date}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded p-1 text-voxar-text-muted hover:bg-voxar-surface-hover hover:text-voxar-text">
                        <Play size={14} />
                      </button>
                      <button className="rounded p-1 text-voxar-text-muted hover:bg-voxar-surface-hover hover:text-voxar-text">
                        <Download size={14} />
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
