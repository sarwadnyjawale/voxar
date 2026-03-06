"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "lifetime",
    description: "Quality teaser. Hear the output before committing.",
    popular: false,
    dimmed: true,
    features: [
      { text: "3 minutes TTS (lifetime total)", included: true },
      { text: "Hindi + English", included: true },
      { text: "Watermarked output", included: true },
      { text: "Slow queue priority", included: true },
      { text: "Voice cloning", included: false },
    ],
    cta: "Get Started Free",
    href: "/signup",
  },
  {
    name: "Access",
    price: "199",
    period: "/month",
    description: "Remove watermark and feel the premium experience.",
    popular: false,
    dimmed: false,
    features: [
      { text: "10 minutes TTS", included: true },
      { text: "1 voice clone", included: true },
      { text: "15 minutes transcription", included: true },
      { text: "No watermark", included: true },
      { text: "Standard queue", included: true },
    ],
    cta: "Subscribe",
    href: "/signup?plan=access",
  },
  {
    name: "Starter",
    price: "499",
    period: "/month",
    description: "The sweet spot. 120 minutes and all 12 languages unlocked.",
    popular: true,
    dimmed: false,
    features: [
      { text: "120 minutes TTS", included: true },
      { text: "3 voice clones", included: true },
      { text: "All 12 languages", included: true },
      { text: "5 hours transcription", included: true },
      { text: "SRT/VTT subtitle export", included: true },
      { text: "Faster queue priority", included: true },
    ],
    cta: "Subscribe",
    href: "/signup?plan=starter",
  },
  {
    name: "Creator",
    price: "1,499",
    period: "/month",
    description: "For power users and small studios.",
    popular: false,
    dimmed: false,
    features: [
      { text: "500 minutes TTS", included: true },
      { text: "10 voice clones", included: true },
      { text: "Speaker diarization", included: true },
      { text: "20 hours transcription", included: true },
      { text: "Word-level subtitles", included: true },
      { text: "Priority queue", included: true },
    ],
    cta: "Subscribe",
    href: "/signup?plan=creator",
  },
  {
    name: "Pro",
    price: "4,999",
    period: "/month",
    description: "Agencies, studios, and API developers.",
    popular: false,
    dimmed: false,
    features: [
      { text: "2,000 minutes TTS", included: true },
      { text: "25 voice clones", included: true },
      { text: "All features unlocked", included: true },
      { text: "100 hours transcription", included: true },
      { text: "API access", included: true },
      { text: "Priority support (24/7)", included: true },
    ],
    cta: "Subscribe",
    href: "/signup?plan=pro",
  },
];

const faqs = [
  {
    q: "Is the free plan really free forever?",
    a: "Yes. The free plan gives you 3 minutes of TTS generation total (lifetime, not monthly). No credit card required. Once used, upgrade to continue generating.",
  },
  {
    q: "Can I change plans anytime?",
    a: "Yes. Upgrade or downgrade anytime. When you upgrade, the difference is prorated. When you downgrade, your current plan runs until the end of the billing cycle.",
  },
  {
    q: "Is the audio quality different between plans?",
    a: "No. Audio quality is identical across all plans. Only usage limits and feature access differ. We never degrade output quality.",
  },
  {
    q: "What happens when I hit my limit?",
    a: "You can upgrade instantly with one click. Your existing content is always accessible. No data is lost.",
  },
  {
    q: "Why is API access only on Pro?",
    a: "API users consume disproportionate resources via automated requests. The Pro plan includes infrastructure guarantees (SLA, rate limits, dedicated queue) to ensure API stability.",
  },
  {
    q: "Do you support Razorpay?",
    a: "Yes. All payments are processed securely via Razorpay. We support UPI, cards, net banking, and wallets.",
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-[#030303] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-voxar-text-secondary">
              More generation time per rupee than any alternative.
            </p>
          </div>
        </ScrollReveal>

        {/* Toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className={`text-sm ${!annual ? "text-white" : "text-voxar-text-muted"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative h-6 w-11 rounded-full transition-colors ${annual ? "bg-voxar-violet" : "bg-voxar-border"}`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${annual ? "translate-x-5.5" : "translate-x-0.5"}`}
            />
          </button>
          <span
            className={`text-sm ${annual ? "text-white" : "text-voxar-text-muted"}`}
          >
            Annual{" "}
            <span className="text-voxar-success text-xs">(Save 20%)</span>
          </span>
        </div>

        {/* Row 1: Free, Access, Starter */}
        <ScrollReveal delay={100}>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {plans.slice(0, 3).map((plan) => (
              <GlassCard
                key={plan.name}
                className={`relative p-5 transition-all ${
                  plan.popular
                    ? "shadow-[0_0_30px_rgba(139,92,246,0.15)] border-voxar-violet/40"
                    : ""
                } ${plan.dimmed ? "opacity-70" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-voxar-violet to-purple-500 px-3 py-0.5 text-[10px] font-semibold text-white">
                    MOST POPULAR
                  </div>
                )}

                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-white">
                    {plan.price === "0"
                      ? "Free"
                      : `\u20B9${annual && plan.price !== "0" ? Math.round(parseInt(plan.price.replace(",", "")) * 0.8).toLocaleString("en-IN") : plan.price}`}
                  </span>
                  {plan.price !== "0" && (
                    <span className="text-sm text-voxar-text-muted">
                      {plan.period}
                    </span>
                  )}
                </div>

                <p className="mt-2 min-h-[2rem] text-xs text-voxar-text-muted">
                  {plan.description}
                </p>

                <Button
                  asChild
                  className={`mt-4 w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="sm"
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>

                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.text}
                      className="flex items-start gap-2 text-xs"
                    >
                      {feature.included ? (
                        <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-voxar-success" />
                      ) : (
                        <X className="mt-0.5 h-3 w-3 flex-shrink-0 text-voxar-text-muted/50" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-voxar-text-secondary"
                            : "text-voxar-text-muted/50"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </ScrollReveal>

        {/* Row 2: Creator, Pro (centered) */}
        <ScrollReveal delay={200}>
          <div className="mt-4 grid gap-4 md:grid-cols-2 md:max-w-2xl md:mx-auto">
            {plans.slice(3).map((plan) => (
              <GlassCard key={plan.name} className="relative p-5">
                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-white">
                    {`\u20B9${annual ? Math.round(parseInt(plan.price.replace(",", "")) * 0.8).toLocaleString("en-IN") : plan.price}`}
                  </span>
                  <span className="text-sm text-voxar-text-muted">
                    {plan.period}
                  </span>
                </div>

                <p className="mt-2 min-h-[2rem] text-xs text-voxar-text-muted">
                  {plan.description}
                </p>

                <Button
                  asChild
                  className="mt-4 w-full"
                  variant="outline"
                  size="sm"
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>

                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.text}
                      className="flex items-start gap-2 text-xs"
                    >
                      <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-voxar-success" />
                      <span className="text-voxar-text-secondary">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </ScrollReveal>

        {/* Enterprise */}
        <ScrollReveal delay={300}>
          <GlassCard className="mt-6 p-6 text-center">
            <h3 className="text-lg font-semibold text-white">Enterprise</h3>
            <p className="mt-1 text-sm text-voxar-text-secondary">
              Unlimited usage, dedicated GPU allocation, custom voice training,
              SLA + dedicated support.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </GlassCard>
        </ScrollReveal>

        {/* Below plans info */}
        <p className="mt-6 text-center text-xs text-voxar-text-muted">
          All plans include: Cancel anytime | Razorpay secure payments | Quality
          identical across all plans
        </p>
        <p className="mt-1 text-center text-xs text-voxar-text-muted">
          Free plan is lifetime -- no credit card required
        </p>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h3 className="mb-8 text-center text-xl font-semibold text-white">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <GlassCard key={faq.q}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-medium text-white hover:text-voxar-violet-glow">
                    {faq.q}
                    <span className="text-voxar-text-muted transition-transform group-open:rotate-180">
                      &#9662;
                    </span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-voxar-text-secondary">
                    {faq.a}
                  </div>
                </details>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
