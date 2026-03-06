"use client";

import { useState, useRef } from "react";
import { Upload, Check, Play, Square, ArrowRight, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4;

export default function VoiceCloningPage() {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [voiceName, setVoiceName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleUpload = async () => {
    if (!file || !voiceName.trim()) return;
    setStep(2);
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 3000));
    setProcessing(false);
    setStep(3);
  };

  const handleConfirm = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    setStep(4);
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicators */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${
                step >= s
                  ? "bg-voxar-violet text-white"
                  : "border border-voxar-border text-voxar-text-muted"
              }`}
            >
              {step > s ? <Check size={14} /> : s}
            </div>
            {s < 4 && (
              <div
                className={`h-px w-12 ${
                  step > s ? "bg-voxar-violet" : "bg-voxar-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="mb-8 flex justify-between px-2 text-[10px] text-voxar-text-muted">
        <span>Upload</span>
        <span>Processing</span>
        <span>Preview</span>
        <span>Done</span>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
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
              accept=".wav,.mp3"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {file ? (
              <div>
                <FileAudio className="mx-auto mb-3 h-10 w-10 text-voxar-success" />
                <p className="text-sm font-medium text-voxar-text">{file.name}</p>
                <p className="mt-1 text-xs text-voxar-text-muted">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-2 text-xs text-voxar-error hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto mb-3 h-10 w-10 text-voxar-text-muted" />
                <p className="text-sm font-medium text-voxar-text">
                  Drop your audio file here
                </p>
                <p className="mt-1 text-xs text-voxar-text-muted">
                  WAV or MP3 format, max 15MB
                </p>
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="rounded-lg border border-voxar-border/30 bg-voxar-surface p-4">
            <h4 className="text-xs font-medium text-voxar-text mb-2">
              Requirements for best results
            </h4>
            <ul className="space-y-1.5 text-xs text-voxar-text-muted">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-voxar-violet" />
                10-120 seconds of clear speech
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-voxar-violet" />
                Quiet environment, no background noise
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-voxar-violet" />
                Single speaker only
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-voxar-violet" />
                WAV or MP3 format, max 15MB
              </li>
            </ul>
          </div>

          {/* Voice name */}
          <div>
            <Label className="text-voxar-text-secondary">Voice Name</Label>
            <Input
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              placeholder="e.g., My Brand Voice"
              className="mt-1 border-voxar-border bg-voxar-surface"
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || !voiceName.trim()}
            className="w-full bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
          >
            Upload & Analyze <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-voxar-violet/20 border-t-voxar-violet" />
          <h3 className="text-lg font-semibold text-voxar-text">
            Analyzing voice quality...
          </h3>
          <p className="mt-2 text-sm text-voxar-text-secondary">
            This usually takes 15-30 seconds
          </p>
          <Progress value={65} className="mt-4 mx-auto max-w-xs" />
        </div>
      )}

      {/* Step 3: Preview & Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Quality Analysis */}
          <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
            <h3 className="text-sm font-medium text-voxar-text mb-4">
              Quality Analysis
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "Quality Score", value: "8.5 / 10 (Grade A)", color: "text-voxar-success" },
                { label: "SNR", value: "Good", color: "text-voxar-success" },
                { label: "Speech Ratio", value: "87%", color: "text-voxar-text-secondary" },
                { label: "Clipping", value: "None", color: "text-voxar-success" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg bg-voxar-bg p-3">
                  <p className="text-voxar-text-muted">{label}</p>
                  <p className={`mt-1 font-medium ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-voxar-text-muted">
              Tip: Try recording in a quieter environment for even better results.
            </p>
          </div>

          {/* Audio Comparison */}
          <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
            <h3 className="text-sm font-medium text-voxar-text mb-4">
              Compare Audio
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-voxar-bg p-3 text-center">
                <p className="text-xs text-voxar-text-muted mb-2">Original</p>
                <button className="flex mx-auto h-10 w-10 items-center justify-center rounded-full border border-voxar-border hover:bg-voxar-surface-hover">
                  <Play size={14} className="text-voxar-text-secondary" />
                </button>
              </div>
              <div className="rounded-lg bg-voxar-bg p-3 text-center">
                <p className="text-xs text-voxar-text-muted mb-2">Cleaned</p>
                <button className="flex mx-auto h-10 w-10 items-center justify-center rounded-full border border-voxar-violet/50 hover:bg-voxar-violet/10">
                  <Play size={14} className="text-voxar-violet" />
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={processing}
            className="w-full bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
          >
            {processing ? "Saving..." : "Confirm & Save Voice"}
          </Button>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 4 && (
        <div className="rounded-xl border border-voxar-success/30 bg-voxar-success/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-voxar-success/20">
            <Check className="h-8 w-8 text-voxar-success" />
          </div>
          <h3 className="text-xl font-semibold text-voxar-text">
            Voice cloned successfully!
          </h3>
          <p className="mt-2 text-sm text-voxar-text-secondary">
            &ldquo;{voiceName}&rdquo; is now available in your voice library.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
            >
              <Link href="/dashboard/tts">Generate with this voice</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep(1);
                setFile(null);
                setVoiceName("");
              }}
            >
              Clone Another Voice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
