"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraMesh } from "@/components/ui/aurora-mesh";
import { GlassCard } from "@/components/ui/glass-card";

const sampleVoices = [
  { id: "aisha", name: "Aisha", gender: "Female", lang: "EN, HI" },
  { id: "vikram", name: "Vikram", gender: "Male", lang: "EN, HI" },
  { id: "priya", name: "Priya", gender: "Female", lang: "EN, HI, TA" },
  { id: "arjun", name: "Arjun", gender: "Male", lang: "EN, HI, MR" },
];

const placeholderTexts = [
  "Type anything. Hear it come alive...",
  "Namaste, VOXAR mein aapka swagat hai...",
  "Transform your content with AI voice...",
];

function WordReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block animate-fade-in-up opacity-0"
          style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "forwards" }}
        >
          {word}{i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

export function HeroSection() {
  const [demoText, setDemoText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("aisha");
  const [isPlaying, setIsPlaying] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Auto-typing placeholder effect
  useEffect(() => {
    if (demoText) return; // Stop cycling if user has typed

    const target = placeholderTexts[placeholderIndex];
    let charIndex = 0;
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (charIndex <= target.length) {
        setCurrentPlaceholder(target.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        // Wait, then move to next
        setTimeout(() => {
          setCurrentPlaceholder("");
          setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [placeholderIndex, demoText]);

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Aurora mesh background */}
      <div className="absolute inset-0 bg-[#030303]" />
      <AuroraMesh />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pt-24 sm:px-6 lg:px-8 lg:pt-32">
        {/* Headline */}
        <h1 className="text-center text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          <WordReveal text="Voice, Reimagined." />
        </h1>

        <p
          className="animate-fade-in-up mt-6 max-w-2xl text-center text-lg font-light text-voxar-text-secondary sm:text-xl opacity-0"
          style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
        >
          Studio-grade AI voice infrastructure for multilingual creators.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in-up mt-8 flex gap-4 opacity-0"
          style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}
        >
          <Button
            size="lg"
            asChild
            className="bg-white px-8 text-base font-medium text-black hover:bg-white/90 hover:scale-[1.02] transition-transform"
          >
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button
            size="lg"
            asChild
            className="glass-card border-[rgba(255,255,255,0.12)] bg-transparent px-8 text-base text-white hover:bg-[rgba(255,255,255,0.08)] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
          >
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>

        {/* Demo Widget */}
        <div
          className="animate-fade-in-up mt-12 w-full max-w-2xl opacity-0"
          style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
        >
          <GlassCard hero className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-voxar-success" />
              <span className="text-xs font-medium text-voxar-text-secondary">
                Live Demo
              </span>
            </div>

            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              placeholder={currentPlaceholder || placeholderTexts[0]}
              className="w-full resize-none rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 text-lg text-white placeholder:text-voxar-text-muted focus:border-voxar-violet/50 focus:outline-none focus:ring-1 focus:ring-voxar-violet/30 sm:text-xl"
              rows={2}
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* Voice pills */}
              <div className="flex flex-wrap gap-2">
                {sampleVoices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                      selectedVoice === voice.id
                        ? "bg-voxar-violet/20 text-voxar-violet-glow ring-1 ring-voxar-violet/40"
                        : "bg-[rgba(255,255,255,0.05)] text-voxar-text-muted hover:bg-[rgba(255,255,255,0.08)]"
                    }`}
                  >
                    {voice.name}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-3">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
                >
                  {isPlaying ? (
                    <>
                      <Square size={16} className="mr-2" /> Stop
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-2" /> Generate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Keyboard hint */}
            <p className="mt-3 text-center text-[10px] text-voxar-text-muted/60">
              Press Ctrl+Enter to generate
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030303] to-transparent" />
    </section>
  );
}
