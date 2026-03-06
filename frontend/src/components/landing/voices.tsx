"use client";

import { Play, Square } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";

const voices = [
  {
    id: "aisha",
    name: "Aisha",
    gender: "Female",
    languages: ["EN", "HI"],
    styles: ["Narration", "Conversational"],
  },
  {
    id: "vikram",
    name: "Vikram",
    gender: "Male",
    languages: ["EN", "HI"],
    styles: ["News", "Narration"],
  },
  {
    id: "priya",
    name: "Priya",
    gender: "Female",
    languages: ["EN", "HI", "TA"],
    styles: ["Conversational", "Storytelling"],
  },
  {
    id: "arjun",
    name: "Arjun",
    gender: "Male",
    languages: ["EN", "HI", "MR"],
    styles: ["Narration", "Documentary"],
  },
  {
    id: "meera",
    name: "Meera",
    gender: "Female",
    languages: ["EN", "HI", "BN"],
    styles: ["Audiobook", "Calm"],
  },
  {
    id: "raj",
    name: "Raj",
    gender: "Male",
    languages: ["EN", "HI", "TE"],
    styles: ["News", "Professional"],
  },
  {
    id: "ananya",
    name: "Ananya",
    gender: "Female",
    languages: ["EN", "HI", "KN"],
    styles: ["Energetic", "Marketing"],
  },
  {
    id: "karthik",
    name: "Karthik",
    gender: "Male",
    languages: ["EN", "HI", "TA", "ML"],
    styles: ["Narration", "Calm"],
  },
];

export function VoicesSection() {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <section id="voices" className="bg-[#030303] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              20+ Neural AI Voices
            </h2>
            <p className="mt-4 text-lg text-voxar-text-secondary">
              Professional voices across 12 languages. Preview and pick the
              perfect voice for your content.
            </p>
          </div>
        </ScrollReveal>

        {/* Scrollable carousel */}
        <div className="mt-12 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: "max-content" }}>
            {voices.map((voice, i) => (
              <ScrollReveal key={voice.id} delay={i * 50}>
                <GlassCard className="w-64 flex-shrink-0 p-5 transition-all hover:border-voxar-violet/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                  {/* Avatar */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-voxar-violet/20 to-voxar-violet-glow/20">
                      <span className="text-sm font-semibold text-voxar-violet">
                        {voice.name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {voice.name}
                      </h3>
                      <span className="text-xs text-voxar-text-muted">
                        {voice.gender}
                      </span>
                    </div>
                  </div>

                  {/* Language badges */}
                  <div className="mb-3 flex flex-wrap gap-1">
                    {voice.languages.map((lang) => (
                      <Badge
                        key={lang}
                        variant="secondary"
                        className="text-[10px] bg-voxar-violet/10 text-voxar-violet-glow border-0"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>

                  {/* Style tags */}
                  <div className="mb-4 flex flex-wrap gap-1">
                    {voice.styles.map((style) => (
                      <span
                        key={style}
                        className="text-[10px] text-voxar-text-muted"
                      >
                        {style}
                        {style !== voice.styles[voice.styles.length - 1] &&
                          " / "}
                      </span>
                    ))}
                  </div>

                  {/* Play button */}
                  <button
                    onClick={() =>
                      setPlayingId(playingId === voice.id ? null : voice.id)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] py-2 text-xs text-voxar-text-secondary transition-colors hover:border-voxar-violet/50 hover:text-voxar-violet"
                  >
                    {playingId === voice.id ? (
                      <>
                        <Square size={12} /> Stop Preview
                      </>
                    ) : (
                      <>
                        <Play size={12} /> Play Sample
                      </>
                    )}
                  </button>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            asChild
            className="border-voxar-violet/50 text-voxar-violet hover:bg-voxar-violet/10"
          >
            <Link href="/signup">+ Clone Your Own Voice</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
