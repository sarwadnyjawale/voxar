"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Play,
  Square,
  Download,
  Copy,
  FileText,
  Clock,
  Globe,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useSTTStore } from "@/stores";

const languages = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "bn", label: "Bengali" },
  { value: "mr", label: "Marathi" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
];

const demoSegments = [
  { start: 0.5, end: 3.2, text: "Hello, welcome to today's episode.", speaker: "SPEAKER_00" },
  { start: 3.5, end: 7.1, text: "Thank you for having me. It's great to be here.", speaker: "SPEAKER_01" },
  { start: 7.5, end: 12.0, text: "Today we're going to discuss the future of AI voice technology.", speaker: "SPEAKER_00" },
  { start: 12.3, end: 16.8, text: "Yes, it's an incredibly exciting field with rapid advancements.", speaker: "SPEAKER_01" },
  { start: 17.2, end: 22.5, text: "Let's start with text-to-speech. How has it evolved in the last year?", speaker: "SPEAKER_00" },
  { start: 22.8, end: 28.0, text: "The quality jump has been remarkable. Neural models now sound nearly indistinguishable from human speech.", speaker: "SPEAKER_01" },
];

const speakerColors: Record<string, string> = {
  SPEAKER_00: "text-voxar-violet",
  SPEAKER_01: "text-voxar-cyan",
  SPEAKER_02: "text-voxar-success",
  SPEAKER_03: "text-voxar-warning",
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TranscribePage() {
  const {
    task, setTask,
    language, setLanguage,
    diarization, setDiarization,
    speakerCount, setSpeakerCount,
    subtitleFormat, setSubtitleFormat,
    wordTimestamps, setWordTimestamps,
    isTranscribing, setTranscribing,
  } = useSTTStore();

  const [file, setFile] = useState<File | null>(null);
  const [transcribed, setTranscribed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setTranscribing(true);
    await new Promise((r) => setTimeout(r, 3000));
    setTranscribing(false);
    setTranscribed(true);
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left Column - Input */}
      <div className="flex-1 space-y-4 lg:max-w-[50%]">
        {/* File Upload */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-voxar-violet bg-voxar-violet/5"
              : file
                ? "border-voxar-success/50 bg-voxar-success/5"
                : "border-voxar-border/50 bg-voxar-surface hover:border-voxar-border"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".wav,.mp3,.flac,.ogg,.m4a,.mp4,.mkv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {file ? (
            <div>
              <FileText className="mx-auto mb-2 h-8 w-8 text-voxar-success" />
              <p className="text-sm font-medium text-voxar-text">{file.name}</p>
              <p className="mt-1 text-xs text-voxar-text-muted">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setTranscribed(false);
                }}
                className="mt-2 text-xs text-voxar-error hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto mb-2 h-8 w-8 text-voxar-text-muted" />
              <p className="text-sm font-medium text-voxar-text">
                Upload audio or video file
              </p>
              <p className="mt-1 text-xs text-voxar-text-muted">
                WAV, MP3, FLAC, OGG, M4A, MP4, MKV - Max 100MB
              </p>
            </div>
          )}
        </div>

        {/* Transcription Settings */}
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-4 space-y-4">
          <h3 className="text-sm font-medium text-voxar-text">Settings</h3>

          {/* Task toggle */}
          <div>
            <label className="text-xs text-voxar-text-muted mb-2 block">Task</label>
            <div className="flex gap-2">
              {(["transcribe", "translate"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTask(t)}
                  className={`rounded-lg border px-4 py-2 text-xs capitalize transition-all ${
                    task === t
                      ? "border-voxar-cyan bg-voxar-cyan/10 text-voxar-cyan"
                      : "border-voxar-border/30 text-voxar-text-muted hover:border-voxar-border"
                  }`}
                >
                  {t === "translate" ? "Translate to English" : t}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-xs text-voxar-text-muted mb-2 block">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-voxar-border/30 bg-voxar-surface-hover px-3 py-2 text-xs text-voxar-text focus:border-voxar-cyan focus:outline-none"
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Speaker Diarization */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs text-voxar-text-secondary">Speaker Diarization</label>
              <p className="text-[10px] text-voxar-text-muted">Identify who said what</p>
            </div>
            <Switch
              checked={diarization}
              onCheckedChange={setDiarization}
            />
          </div>

          {diarization && (
            <div>
              <label className="text-xs text-voxar-text-muted mb-2 block">Number of Speakers</label>
              <select
                value={speakerCount}
                onChange={(e) => setSpeakerCount(e.target.value)}
                className="w-full rounded-lg border border-voxar-border/30 bg-voxar-surface-hover px-3 py-2 text-xs text-voxar-text focus:border-voxar-cyan focus:outline-none"
              >
                <option value="auto">Auto-detect</option>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n} speakers</option>
                ))}
              </select>
            </div>
          )}

          {/* Subtitle Format */}
          <div>
            <label className="text-xs text-voxar-text-muted mb-2 block">Subtitle Format</label>
            <div className="flex gap-2">
              {["srt", "vtt", "both"].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSubtitleFormat(fmt)}
                  className={`rounded-lg border px-4 py-2 text-xs uppercase transition-all ${
                    subtitleFormat === fmt
                      ? "border-voxar-cyan bg-voxar-cyan/10 text-voxar-cyan"
                      : "border-voxar-border/30 text-voxar-text-muted hover:border-voxar-border"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Word Timestamps */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs text-voxar-text-secondary">Word Timestamps</label>
              <p className="text-[10px] text-voxar-text-muted">Per-word timing data</p>
            </div>
            <Switch
              checked={wordTimestamps}
              onCheckedChange={setWordTimestamps}
            />
          </div>
        </div>

        {/* Transcribe Button */}
        <Button
          onClick={handleTranscribe}
          disabled={isTranscribing || !file}
          className="w-full bg-gradient-to-r from-voxar-cyan to-blue-500 py-6 text-base font-medium hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50"
        >
          {isTranscribing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Transcribing...
            </span>
          ) : (
            "Transcribe"
          )}
        </Button>
      </div>

      {/* Right Column - Output */}
      <div className="flex-1 space-y-4">
        {/* Transcript Viewer */}
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
          <h3 className="mb-4 text-sm font-medium text-voxar-text">
            Transcript
          </h3>

          {transcribed ? (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {demoSegments.map((seg, i) => (
                <button
                  key={i}
                  className="flex w-full gap-3 rounded-lg p-2 text-left transition-colors hover:bg-voxar-surface-hover"
                >
                  <span className="mt-0.5 text-[10px] font-mono text-voxar-text-muted w-10 flex-shrink-0">
                    {formatTime(seg.start)}
                  </span>
                  {diarization && (
                    <span
                      className={`mt-0.5 text-[10px] font-mono w-24 flex-shrink-0 ${
                        speakerColors[seg.speaker] || "text-voxar-text-muted"
                      }`}
                    >
                      {seg.speaker}
                    </span>
                  )}
                  <span className="text-sm text-voxar-text-secondary">
                    {seg.text}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-voxar-text-muted">
              Transcript will appear here after processing
            </div>
          )}
        </div>

        {/* Detection Info */}
        {transcribed && (
          <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
            <h3 className="mb-3 text-sm font-medium text-voxar-text">
              Detection Info
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { icon: Globe, label: "Language", value: "English (98%)" },
                { icon: Clock, label: "Duration", value: "5:32" },
                { icon: FileText, label: "Segments", value: "47" },
                { icon: Users, label: "Speakers", value: diarization ? "2" : "1" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg bg-voxar-bg p-2.5"
                >
                  <Icon size={14} className="text-voxar-cyan" />
                  <div>
                    <p className="text-[10px] text-voxar-text-muted">{label}</p>
                    <p className="text-voxar-text-secondary">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download Section */}
        {transcribed && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="text-xs">
                <Download size={14} className="mr-1.5" /> Download SRT
              </Button>
              <Button variant="outline" className="text-xs">
                <Download size={14} className="mr-1.5" /> Download VTT
              </Button>
              <Button variant="outline" className="text-xs">
                <Download size={14} className="mr-1.5" /> Download JSON
              </Button>
              <Button variant="outline" className="text-xs">
                <Copy size={14} className="mr-1.5" /> Copy Transcript
              </Button>
            </div>
            {wordTimestamps && (
              <Button variant="outline" className="w-full text-xs">
                <Download size={14} className="mr-1.5" /> Download Word-level SRT
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
