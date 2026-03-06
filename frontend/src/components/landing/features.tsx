import {
  Mic,
  Fingerprint,
  AudioLines,
  Users,
  Captions,
  Globe,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CountUp } from "@/components/ui/count-up";

const features = [
  {
    icon: Mic,
    title: "Neural Text-to-Speech",
    description:
      "Convert any text to natural human-like speech with native pronunciation across 12 languages.",
    stat: { value: 20, suffix: "+", label: "Voices" },
    large: true,
  },
  {
    icon: Fingerprint,
    title: "Voice Cloning",
    description:
      "Clone any voice from a short audio sample. Create custom brand voices in minutes.",
    stat: { value: 30, suffix: "s", label: "Sample Required" },
    large: true,
  },
  {
    icon: AudioLines,
    title: "Speech-to-Text",
    description:
      "Transcribe audio and video in 99 languages with word-level timestamps. 4x faster than real-time.",
    stat: null,
    large: false,
  },
  {
    icon: Users,
    title: "Speaker Diarization",
    description:
      "Identify who said what in podcasts, meetings, and interviews automatically.",
    stat: null,
    large: false,
  },
  {
    icon: Captions,
    title: "AI Subtitles",
    description:
      "Generate SRT and VTT subtitles instantly. YouTube-ready with word-level karaoke mode.",
    stat: null,
    large: false,
  },
  {
    icon: Globe,
    title: "Multilingual Intelligence",
    description:
      "Native Hinglish auto-transliteration with 500+ word dictionary. Zero-config language mixing.",
    stat: { value: 12, suffix: "", label: "Languages" },
    large: false,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-[#030303] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything You Need for Production-Grade Audio
            </h2>
            <p className="mt-4 text-lg text-voxar-text-secondary">
              A complete AI audio toolkit, built for creators who ship.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Row 1: 2 large cards spanning 2 cols each */}
          {features
            .filter((f) => f.large)
            .map((feature, i) => (
              <ScrollReveal
                key={feature.title}
                delay={i * 100}
                className="sm:col-span-2"
              >
                <GlassCard className="p-6 h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-voxar-violet/10">
                        <feature.icon className="h-5 w-5 text-voxar-violet" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-voxar-text-secondary">
                        {feature.description}
                      </p>
                    </div>
                    {feature.stat && (
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">
                          <CountUp
                            end={feature.stat.value}
                            suffix={feature.stat.suffix}
                          />
                        </div>
                        <div className="mt-1 text-xs text-voxar-text-muted">
                          {feature.stat.label}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}

          {/* Row 2: 4 small cards, 1 col each */}
          {features
            .filter((f) => !f.large)
            .map((feature, i) => (
              <ScrollReveal key={feature.title} delay={200 + i * 100}>
                <GlassCard className="p-5 h-full">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-voxar-violet/10">
                    <feature.icon className="h-4 w-4 text-voxar-violet" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-voxar-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.stat && (
                    <div className="mt-3 text-lg font-bold text-white">
                      <CountUp
                        end={feature.stat.value}
                        suffix={feature.stat.suffix}
                      />
                      <span className="ml-1.5 text-xs font-normal text-voxar-text-muted">
                        {feature.stat.label}
                      </span>
                    </div>
                  )}
                </GlassCard>
              </ScrollReveal>
            ))}
        </div>
      </div>
    </section>
  );
}
