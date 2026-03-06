"use client";

import { useState } from "react";
import {
  Play,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUsageStore } from "@/stores";

const jobHistory = [
  {
    id: "job_001",
    type: "TTS" as const,
    input: "Welcome to today's episode of AI Voice Weekly. In this special edition, we explore the latest breakthroughs...",
    voice: "Aisha",
    language: "English",
    status: "completed" as const,
    duration: "12.3s",
    qualityScore: 85,
    engine: "VXR-Core",
    date: "2026-03-03 14:32",
  },
  {
    id: "job_002",
    type: "STT" as const,
    input: "interview_recording.mp3",
    voice: "-",
    language: "Hindi (detected)",
    status: "completed" as const,
    duration: "5:32",
    qualityScore: null,
    engine: "VXR-Scribe",
    date: "2026-03-03 10:15",
  },
  {
    id: "job_003",
    type: "TTS" as const,
    input: "Product launch announcement for the new VOXAR platform. Experience the future of AI voice technology...",
    voice: "Vikram",
    language: "English",
    status: "completed" as const,
    duration: "8.7s",
    qualityScore: 92,
    engine: "VXR-Core",
    date: "2026-03-02 18:45",
  },
  {
    id: "job_004",
    type: "TTS" as const,
    input: "Script draft v2 for YouTube...",
    voice: "Priya",
    language: "Hinglish",
    status: "failed" as const,
    duration: "-",
    qualityScore: null,
    engine: "-",
    date: "2026-03-02 16:20",
  },
  {
    id: "job_005",
    type: "STT" as const,
    input: "podcast_ep12.wav",
    voice: "-",
    language: "English (detected)",
    status: "completed" as const,
    duration: "45:12",
    qualityScore: null,
    engine: "VXR-Scribe",
    date: "2026-03-01 09:30",
  },
  {
    id: "job_006",
    type: "TTS" as const,
    input: "Hindi narration for educational content about solar energy and renewable resources in India...",
    voice: "Arjun",
    language: "Hindi",
    status: "completed" as const,
    duration: "15.1s",
    qualityScore: 88,
    engine: "VXR-Core",
    date: "2026-02-28 20:10",
  },
];

export default function HistoryPage() {
  const {
    ttsMinutesUsed,
    ttsMinutesLimit,
    sttMinutesUsed,
    sttMinutesLimit,
    voiceClonesUsed,
    voiceClonesLimit,
    plan,
    resetDate,
  } = useUsageStore();

  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = jobHistory.filter((job) => {
    if (typeFilter !== "all" && job.type !== typeFilter) return false;
    if (statusFilter !== "all" && job.status !== statusFilter) return false;
    return true;
  });

  const ttsPercent = (ttsMinutesUsed / ttsMinutesLimit) * 100;
  const sttPercent = (sttMinutesUsed / sttMinutesLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-4">
          <p className="text-xs text-voxar-text-muted">TTS Used</p>
          <p className="mt-1 text-2xl font-bold text-voxar-text">
            {ttsMinutesUsed}<span className="text-sm font-normal text-voxar-text-muted"> / {ttsMinutesLimit} min</span>
          </p>
          <Progress value={ttsPercent} className="mt-2 h-1.5" />
        </div>
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-4">
          <p className="text-xs text-voxar-text-muted">STT Used</p>
          <p className="mt-1 text-2xl font-bold text-voxar-text">
            {sttMinutesUsed}<span className="text-sm font-normal text-voxar-text-muted"> / {sttMinutesLimit} min</span>
          </p>
          <Progress value={sttPercent} className="mt-2 h-1.5" />
        </div>
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-4">
          <p className="text-xs text-voxar-text-muted">Voice Clones</p>
          <p className="mt-1 text-2xl font-bold text-voxar-text">
            {voiceClonesUsed}<span className="text-sm font-normal text-voxar-text-muted"> / {voiceClonesLimit}</span>
          </p>
          <Progress value={(voiceClonesUsed / voiceClonesLimit) * 100} className="mt-2 h-1.5" />
        </div>
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-4">
          <p className="text-xs text-voxar-text-muted">Resets In</p>
          <p className="mt-1 text-2xl font-bold text-voxar-text">15 days</p>
          <p className="mt-2 text-xs text-voxar-text-muted capitalize">{plan} plan</p>
        </div>
      </div>

      {/* Job History */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-voxar-text">Job History</h2>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-voxar-border bg-voxar-surface px-3 py-1.5 text-xs text-voxar-text focus:border-voxar-violet focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="TTS">TTS</option>
              <option value="STT">STT</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-voxar-border bg-voxar-surface px-3 py-1.5 text-xs text-voxar-text focus:border-voxar-violet focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-voxar-border/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-voxar-border/30 bg-voxar-surface">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted">Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted">Type</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted md:table-cell">Input</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted sm:table-cell">Voice</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted">Status</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-voxar-text-muted lg:table-cell">Duration</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-voxar-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <>
                  <tr
                    key={job.id}
                    className="border-b border-voxar-border/20 last:border-0 hover:bg-voxar-surface/50 cursor-pointer"
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  >
                    <td className="px-4 py-3 text-xs text-voxar-text-muted whitespace-nowrap">{job.date}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] border-0 ${
                          job.type === "TTS"
                            ? "bg-voxar-violet/10 text-voxar-violet"
                            : "bg-voxar-cyan/10 text-voxar-cyan"
                        }`}
                      >
                        {job.type}
                      </Badge>
                    </td>
                    <td className="hidden max-w-[200px] truncate px-4 py-3 text-xs text-voxar-text-secondary md:table-cell">
                      {job.input}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-voxar-text-secondary sm:table-cell">{job.voice}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${job.status === "completed" ? "text-voxar-success" : "text-voxar-error"}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-voxar-text-muted lg:table-cell">{job.duration}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="rounded p-1 text-voxar-text-muted hover:bg-voxar-surface-hover hover:text-voxar-text">
                          <Play size={14} />
                        </button>
                        <button className="rounded p-1 text-voxar-text-muted hover:bg-voxar-surface-hover hover:text-voxar-text">
                          <Download size={14} />
                        </button>
                        <button className="rounded p-1 text-voxar-text-muted hover:bg-voxar-surface-hover hover:text-voxar-error">
                          <Trash2 size={14} />
                        </button>
                        <button className="rounded p-1 text-voxar-text-muted">
                          {expandedJob === job.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedJob === job.id && (
                    <tr key={`${job.id}-detail`}>
                      <td colSpan={7} className="bg-voxar-bg/50 px-6 py-4">
                        <div className="grid gap-3 sm:grid-cols-3 text-xs">
                          <div>
                            <p className="text-voxar-text-muted">Full Input</p>
                            <p className="mt-1 text-voxar-text-secondary">{job.input}</p>
                          </div>
                          <div>
                            <p className="text-voxar-text-muted">Language</p>
                            <p className="mt-1 text-voxar-text-secondary">{job.language}</p>
                          </div>
                          <div>
                            <p className="text-voxar-text-muted">Engine</p>
                            <p className="mt-1 text-voxar-text-secondary">{job.engine}</p>
                          </div>
                          {job.qualityScore && (
                            <div>
                              <p className="text-voxar-text-muted">Quality Score</p>
                              <p className="mt-1 text-voxar-text-secondary">{job.qualityScore}/100</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-voxar-text-muted">
            No jobs match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
