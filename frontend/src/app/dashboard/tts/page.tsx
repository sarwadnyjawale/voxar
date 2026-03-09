"use client";

import { useState } from "react";
import {
  Play,
  Square,
  Download,
  Volume2,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTTSStore } from "@/stores";

const voices = [
  { id: "aisha", name: "Aisha", gender: "Female", accent: "British Documentary" },
  { id: "vikram", name: "Vikram", gender: "Male", accent: "News Anchor" },
  { id: "priya", name: "Priya", gender: "Female", accent: "Conversational" },
  { id: "arjun", name: "Arjun", gender: "Male", accent: "Documentary" },
  { id: "meera", name: "Meera", gender: "Female", accent: "Audiobook" },
  { id: "raj", name: "Raj", gender: "Male", accent: "Professional" },
];

const models = [
  { value: "flash", label: "Voxar Flash", tag: "Fastest", desc: "Low latency, good quality" },
  { value: "cinematic", label: "Voxar Cinematic", tag: "Best", desc: "Highest quality output" },
  { value: "longform", label: "Voxar Longform", tag: null, desc: "Optimized for long texts" },
  { value: "multilingual", label: "Voxar Multilingual", tag: null, desc: "12 language support" },
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
    language, setLanguage,
    isGenerating, setGenerating,
  } = useTTSStore();

  const [stability, setStability] = useState(50);
  const [similarity, setSimilarity] = useState(75);
  const [styleExaggeration, setStyleExaggeration] = useState(0);
  const [speakerBoost, setSpeakerBoost] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [voiceDropdownOpen, setVoiceDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const maxChars = 5000;
  const selectedVoiceData = voices.find((v) => v.id === selectedVoice);
  const selectedModelData = models.find((m) => m.value === mode);

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    setGenerated(true);
  };

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      {/* Left: Text Input Area */}
      <div className="flex flex-1 flex-col">
        {/* Text area */}
        <div className="relative flex flex-1 flex-col rounded-xl border border-voxar-border/50 bg-voxar-surface">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
            placeholder="Type or paste your text here..."
            className="flex-1 resize-none bg-transparent p-5 text-sm leading-relaxed text-voxar-text placeholder:text-voxar-text-muted focus:outline-none"
            style={{ minHeight: "300px" }}
          />

          {/* Audio player bar (shows after generation) */}
          {generated && (
            <div className="border-t border-voxar-border/30 px-5 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-voxar-violet text-white hover:bg-voxar-violet-glow transition-colors"
                >
                  {isPlaying ? <Square size={12} /> : <Play size={12} className="ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="h-1 rounded-full bg-voxar-surface-hover">
                    <div className="h-1 w-1/3 rounded-full bg-voxar-violet" />
                  </div>
                </div>
                <span className="text-[11px] text-voxar-text-muted font-mono">
                  0:04 / 0:12
                </span>
                <button className="text-voxar-text-muted hover:text-voxar-text transition-colors">
                  <Download size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-voxar-text-muted">
            <span>{text.length} / {maxChars} characters</span>
            {text.length > 0 && (
              <span className="text-voxar-text-muted">
                ~{Math.ceil(text.length / 150)} credits
              </span>
            )}
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim() || !selectedVoice}
            className="bg-voxar-violet px-6 text-white hover:bg-voxar-violet-glow disabled:opacity-40"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Volume2 size={15} />
                Generate speech
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Right: Settings Panel */}
      <div className="w-full space-y-4 lg:w-80 xl:w-[340px] flex-shrink-0">
        <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-4">
          <p className="mb-3 text-xs font-medium text-voxar-text-muted uppercase tracking-wider">Settings</p>

          {/* Voice Selector */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs text-voxar-text-secondary">Voice</label>
            <div className="relative">
              <button
                onClick={() => setVoiceDropdownOpen(!voiceDropdownOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-voxar-border/50 bg-voxar-surface-hover px-3 py-2.5 text-sm text-voxar-text transition-colors hover:border-voxar-border"
              >
                <div className="flex items-center gap-2">
                  {selectedVoiceData ? (
                    <>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-voxar-violet/20">
                        <span className="text-[9px] font-semibold text-voxar-violet">
                          {selectedVoiceData.name[0]}
                        </span>
                      </div>
                      <span>{selectedVoiceData.name}</span>
                      <span className="text-[10px] text-voxar-text-muted">
                        {selectedVoiceData.accent}
                      </span>
                    </>
                  ) : (
                    <span className="text-voxar-text-muted">Select a voice</span>
                  )}
                </div>
                <ChevronDown size={14} className={`text-voxar-text-muted transition-transform ${voiceDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {voiceDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-lg border border-voxar-border/50 bg-voxar-surface shadow-lg">
                  {voices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => {
                        setVoice(voice.id);
                        setVoiceDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-voxar-surface-hover ${
                        selectedVoice === voice.id ? "bg-voxar-violet/5 text-voxar-violet" : "text-voxar-text"
                      }`}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-voxar-violet/15">
                        <span className="text-[10px] font-semibold text-voxar-violet">
                          {voice.name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm">{voice.name}</p>
                        <p className="text-[10px] text-voxar-text-muted">
                          {voice.gender} - {voice.accent}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="ml-auto text-voxar-text-muted hover:text-voxar-violet"
                      >
                        <Play size={12} />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Model Selector */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs text-voxar-text-secondary">Model</label>
            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-voxar-border/50 bg-voxar-surface-hover px-3 py-2.5 text-sm text-voxar-text transition-colors hover:border-voxar-border"
              >
                <div className="flex items-center gap-2">
                  <span>{selectedModelData?.label || "Select model"}</span>
                  {selectedModelData?.tag && (
                    <span className="rounded bg-voxar-violet/15 px-1.5 py-0.5 text-[9px] font-medium text-voxar-violet">
                      {selectedModelData.tag}
                    </span>
                  )}
                </div>
                <ChevronDown size={14} className={`text-voxar-text-muted transition-transform ${modelDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {modelDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-voxar-border/50 bg-voxar-surface shadow-lg">
                  {models.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => {
                        setMode(m.value);
                        setModelDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-voxar-surface-hover ${
                        mode === m.value ? "bg-voxar-violet/5 text-voxar-violet" : "text-voxar-text"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{m.label}</span>
                          {m.tag && (
                            <span className="rounded bg-voxar-violet/15 px-1.5 py-0.5 text-[9px] font-medium text-voxar-violet">
                              {m.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-voxar-text-muted">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-voxar-border/30 pt-4 space-y-4">
            {/* Stability */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-voxar-text-secondary">Stability</span>
                <span className="text-voxar-text-muted">{stability}</span>
              </div>
              <Slider
                value={[stability]}
                onValueChange={(v) => setStability(v[0])}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Similarity */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-voxar-text-secondary">Similarity</span>
                <span className="text-voxar-text-muted">{similarity}</span>
              </div>
              <Slider
                value={[similarity]}
                onValueChange={(v) => setSimilarity(v[0])}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Style Exaggeration */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-voxar-text-secondary">Style Exaggeration</span>
                <span className="text-voxar-text-muted">{styleExaggeration}</span>
              </div>
              <Slider
                value={[styleExaggeration]}
                onValueChange={(v) => setStyleExaggeration(v[0])}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Speed */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-voxar-text-secondary">Speed</span>
                <span className="text-voxar-text-muted">{speed}x</span>
              </div>
              <Slider
                value={[speed]}
                onValueChange={(v) => setSpeed(v[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>

          {/* Language Override */}
          <div className="mt-4 border-t border-voxar-border/30 pt-4">
            <label className="mb-1.5 block text-xs text-voxar-text-secondary">Language Override</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-voxar-border/50 bg-voxar-surface-hover px-3 py-2 text-xs text-voxar-text focus:border-voxar-violet focus:outline-none"
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Speaker Boost */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-voxar-text-secondary">Speaker boost</span>
            <Switch checked={speakerBoost} onCheckedChange={setSpeakerBoost} />
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setStability(50);
              setSimilarity(75);
              setStyleExaggeration(0);
              setSpeed(1);
              setSpeakerBoost(true);
            }}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-voxar-border/30 py-2 text-xs text-voxar-text-muted transition-colors hover:border-voxar-border hover:text-voxar-text"
          >
            <RotateCcw size={12} />
            Reset values
          </button>
        </div>
      </div>
    </div>
  );
}
