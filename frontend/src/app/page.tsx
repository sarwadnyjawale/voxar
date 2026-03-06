import { Navbar } from "@/components/shared/navbar";
import { HeroSection } from "@/components/landing/hero";
import { WaveformDivider } from "@/components/ui/waveform-divider";
import { NarrativeSection } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features";
import { VoicesSection } from "@/components/landing/voices";
import { UseCasesSection } from "@/components/landing/use-cases";
import { PricingSection } from "@/components/landing/pricing";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { Footer } from "@/components/shared/footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <WaveformDivider />
      <NarrativeSection />
      <FeaturesSection />
      <VoicesSection />
      <UseCasesSection />
      <PricingSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
