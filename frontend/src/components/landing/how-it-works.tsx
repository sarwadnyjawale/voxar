import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GlassCard } from "@/components/ui/glass-card";

const steps = [
  {
    number: "01",
    title: "Type or Upload",
    description:
      "Paste your script or upload audio for transcription. Text, WAV, MP3, and video supported.",
  },
  {
    number: "02",
    title: "Choose Voice & Language",
    description:
      "Select from 20+ neural voices across 12 languages. Or clone your own.",
  },
  {
    number: "03",
    title: "Generate & Download",
    description:
      "Studio-quality audio in seconds. Export as MP3 or WAV. Subtitles as SRT or VTT.",
  },
];

export function NarrativeSection() {
  return (
    <section className="bg-[#030303] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
            How It Works
          </h2>
        </ScrollReveal>

        <div className="mt-16">
          <GlassCard className="p-8 sm:p-10">
            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((step, index) => (
                <ScrollReveal key={step.number} delay={index * 150}>
                  <div className="relative text-center md:text-left">
                    {/* Connector line (desktop) */}
                    {index < steps.length - 1 && (
                      <div className="absolute right-0 top-8 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-[rgba(255,255,255,0.08)] to-transparent md:block" />
                    )}

                    <span className="font-mono text-5xl font-bold text-voxar-violet/80">
                      {step.number}
                    </span>

                    <h3 className="mt-3 text-lg font-semibold text-white">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm text-voxar-text-secondary">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

// Keep the old export name for backwards compat during transition
export { NarrativeSection as HowItWorksSection };
