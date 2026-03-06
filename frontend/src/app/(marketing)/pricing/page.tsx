import { Navbar } from "@/components/shared/navbar";
import { PricingSection } from "@/components/landing/pricing";
import { Footer } from "@/components/shared/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - VOXAR",
  description:
    "Simple, transparent pricing for AI voice generation. More generation time per rupee than any alternative.",
};

export default function PricingPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-16">
        <PricingSection />
      </div>
      <Footer />
    </main>
  );
}
