"use client";

import { useState, useRef } from "react";
import {
  Play,
  Square,
  Download,
  Pause,
  Type,
  Trash2,
  ChevronDown,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useTTSStore } from "@/stores";

const voices = [
  { id: "aisha", name: "Aisha", gender: "Female", languages: ["EN", "HI"], styles: ["Narration", "Conversational"] },
  { id: "vikram", name: "Vikram", gender: "Male", languages: ["EN", "HI"], styles: ["News", "Narration"] },
  { id: "priya", name: "Priya", gender: "Female", languages: ["EN", "HI", "TA"], styles: ["Conversational", "Storytelling"] },
  { id: "arjun", name: "Arjun", gender: "Male", languages: ["EN", "HI", "MR"], styles: ["Narration", "Documentary"] },
  { id: "meera", name: "Meera", gender: "Female", languages: ["EN", "HI", "BN"], styles: ["Audiobook", "Calm"] },
  { id: "raj", name: "Raj", gender: "Male", languages: ["EN", "HI", "TE"], styles: ["News", "Professional"] },
];

const modes = [
  { value: "flash", label: "Flash", description: "Fast generation" },
  { value: "cinematic", label: "Cinematic", description: "Best quality" },
  { value: "longform", label: "Longform", description: "Long texts" },
  { value: "multilingual", label: "Multilingual", description: "Mixed languages" },
];

const languages = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "bn", label: "Bengali" },
  { value: "mr", label: "Marathi" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "gu", label: "Gujarati" },
  { value: "pa", label: "Punjabi" },
  { value: "or", label: "Odia" },
];

export default function TTSPage() {
  const {
    text, setText,
    selectedVoice, setVoice,
    mode, setMode,
    speed, setSpeed,
    outputFormat, setOutputFormat,
    isGenerating, setGenerating,
    language, setLanguage,
  } = useTTSStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generated, setGenerated] = useState(false);

  const maxChars = 5000;

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return;
    setGenerating(true);
    // Simulate generation
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    setGenerated(true);
  };

  const insertPause = () => {
    setText(text + "[pause:0.5s]");
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left Column - Input (65%) */}
      <div className="flex-1 space-y-4 lg:max-w-[65%]">
        {/* Text Input */}
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-4">
          <div className="mb-2 flex items-center gap-2 border-b border-voxar-border/30 pb-2">
            <button
              onClick={insertPause}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-voxar-text-muted hover:bg-voxar-surface-hover hover:text-voxar-text"
              title="Insert pause"
            >
              <Pause size={12} /> Pause
            </button>
            <button
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-voxar-text-muted hover:bg-voxar-surface-hover hover:text-voxar-text"
              title="Bold for emphasis"
            >
              <Type size={12} /> Emphasis
            </button>
            <button
              onClick={() => setText("")}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-voxar-text-muted hover:bg-voxar-surface-hover hover:text-voxar-error"
              title="Clear text"
            >
              <Trash2 size={12} /> Clear
            </button>
            <div className="ml-auto text-xs text-voxar-text-muted">
              {text.length} / {maxChars}
            </div>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
            placeholder="Type or paste your script here..."
            rows={10}
            className="resize-none border-0 bg-transparent p-0 text-sm text-voxar-text placeholder:text-voxar-text-muted focus-visible:ring-0"
          />

          {text.length > 0 && (
            <div className="mt-2 text-xs text-voxar-text-muted">
              Language: Auto-detected
            </div>
          )}
        </div>

        {/* Voice Selection */}
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-4">
          <h3 className="mb-3 text-sm font-medium text-voxar-text">
            Select Voice
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setVoice(voice.id)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                  selectedVoice === voice.id
                    ? "border-voxar-violet bg-voxar-violet/5"
                    : "border-voxar-border/30 hover:border-voxar-border"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-voxar-violet/20 to-voxar-violet-glow/20">
                  <span className="text-xs font-semibold text-voxar-violet">
                    {voice.name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-voxar-text">
                      {voice.name}
                    </span>
                    <span className="text-[10px] text-voxar-text-muted">
                      {voice.gender}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-0.5">
                    {voice.languages.map((lang) => (
                      <Badge
                        key={lang}
                        variant="secondary"
                        className="text-[9px] h-4 bg-voxar-violet/10 text-voxar-violet-glow border-0 px-1"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
                <button className="text-voxar-text-muted hover:text-voxar-violet">
                  <Play size={14} />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-voxar-text-secondary"
          >
            Generation Settings
            <ChevronDown
              size={16}
              className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {showAdvanced && (
            <div className="border-t border-voxar-border/30 px-4 py-4 space-y-4">
              {/* Mode */}
              <div>
                <label className="text-xs text-voxar-text-muted mb-2 block">
                  Mode
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {modes.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      className={`rounded-lg border px-3 py-2 text-center text-xs transition-all ${
                        mode === m.value
                          ? "border-voxar-violet bg-voxar-violet/10 text-voxar-violet"
                          : "border-voxar-border/30 text-voxar-text-muted hover:border-voxar-border"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed */}
              <div>
                <div className="flex justify-between text-xs text-voxar-text-muted mb-2">
                  <span>Speed</span>
                  <span>{speed}x</span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={(v) => setSpeed(v[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Output Format */}
              <div>
                <label className="text-xs text-voxar-text-muted mb-2 block">
                  Output Format
                </label>
                <div className="flex gap-2">
                  {["mp3", "wav"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`rounded-lg border px-4 py-2 text-xs uppercase transition-all ${
                        outputFormat === fmt
                          ? "border-voxar-violet bg-voxar-violet/10 text-voxar-violet"
                          : "border-voxar-border/30 text-voxar-text-muted hover:border-voxar-border"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Override */}
              <div>
                <label className="text-xs text-voxar-text-muted mb-2 block">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-voxar-border/30 bg-voxar-surface-hover px-3 py-2 text-xs text-voxar-text focus:border-voxar-violet focus:outline-none"
                >
                  {languages.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim() || !selectedVoice}
          className="w-full bg-gradient-to-r from-voxar-violet to-purple-500 py-6 text-base font-medium hover:from-voxar-violet-glow hover:to-purple-400 disabled:opacity-50"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Volume2 size={18} /> Generate Speech
            </span>
          )}
        </Button>
      </div>

      {/* Right Column - Output (35%) */}
      <div className="w-full space-y-4 lg:w-[35%]">
        {/* Audio Player */}
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
          <h3 className="mb-4 text-sm font-medium text-voxar-text">
            Audio Output
          </h3>

          {generated ? (
            <>
              {/* Waveform placeholder */}
              <div className="mb-4 flex h-20 items-end justify-center gap-[2px] rounded-lg bg-voxar-bg p-3">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-voxar-violet/40 to-voxar-violet-glow/60"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-voxar-violet text-white hover:bg-voxar-violet-glow"
                >
                  {isPlaying ? <Square size={16} /> : <Play size={16} />}
                </button>
                <div className="flex-1">
                  <div className="h-1 rounded-full bg-voxar-bg">
                    <div className="h-1 w-1/3 rounded-full bg-voxar-violet" />
                  </div>
                </div>
                <span className="text-xs text-voxar-text-muted font-mono">
                  0:04 / 0:12
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-voxar-text-muted">
              Generated audio will appear here
            </div>
          )}
        </div>

        {/* Result Info */}
        {generated && (
          <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
            <h3 className="mb-3 text-sm font-medium text-voxar-text">
              Result Details
            </h3>
            <div className="space-y-2 text-xs">
              {[
                ["Quality Score", "85/100 (A)"],
                ["Duration", "12.3s"],
                ["Processing Time", "3.2s"],
                ["Engine", "VXR-Core"],
                ["Characters", `${text.length}`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between text-voxar-text-muted"
                >
                  <span>{label}</span>
                  <span className="text-voxar-text-secondary">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download Buttons */}
        {generated && (
          <div className="flex gap-3">
            <Button className="flex-1 bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400">
              <Download size={16} className="mr-2" /> Download MP3
            </Button>
            <Button variant="outline" className="flex-1">
              <Download size={16} className="mr-2" /> WAV
            </Button>
          </div>
        )}

        {/* Recent Generations */}
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
          <h3 className="mb-3 text-sm font-medium text-voxar-text">
            Recent Generations
          </h3>
          <div className="space-y-2">
            {[
              { text: "Welcome to today's episode...", time: "2h ago" },
              { text: "Product launch script...", time: "5h ago" },
              { text: "Hindi narration sample...", time: "1d ago" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-voxar-border/20 p-2"
              >
                <button className="text-voxar-text-muted hover:text-voxar-violet">
                  <Play size={12} />
                </button>
                <span className="flex-1 truncate text-xs text-voxar-text-secondary">
                  {item.text}
                </span>
                <span className="text-[10px] text-voxar-text-muted">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
