import { GlassCard } from "@/components/ui/glass-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const testimonials = [
  {
    name: "Rahul Mehta",
    role: "YouTube Creator, 120K subscribers",
    quote:
      "VOXAR cut my voiceover production time by 80%. The Hindi pronunciation is the best I've seen from any AI tool. My audience can't tell it's AI.",
    avatar: "RM",
  },
  {
    name: "Sneha Patel",
    role: "Podcast Producer",
    quote:
      "The transcription quality is incredible. Speaker diarization works perfectly for my interview podcasts. One tool for everything.",
    avatar: "SP",
  },
  {
    name: "Amit Verma",
    role: "E-Learning Platform, CEO",
    quote:
      "We generate course content in 8 Indian languages. VOXAR's multilingual support is unmatched. The voice cloning feature saved us from hiring 8 voiceover artists.",
    avatar: "AV",
  },
  {
    name: "Priya Krishnan",
    role: "Marketing Agency, Director",
    quote:
      "Production-ready audio in seconds. We use VOXAR for ad campaigns across India. The quality is consistently studio-grade.",
    avatar: "PK",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-[#030303] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Trusted by Creators Worldwide
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 100}>
              <GlassCard className="p-5 h-full">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-voxar-violet/30 to-voxar-cyan/30">
                    <span className="text-xs font-bold text-white">
                      {t.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {t.name}
                    </p>
                    <p className="text-xs text-voxar-text-muted">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-voxar-text-secondary">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
