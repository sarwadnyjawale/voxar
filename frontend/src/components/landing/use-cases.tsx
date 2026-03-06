import { Ticker } from "@/components/ui/ticker";

const useCaseItems = [
  "YouTube Automation",
  "Audiobooks",
  "Podcasts",
  "Short-Form Content",
  "Marketing",
  "E-Learning",
  "Accessibility",
  "News Channels",
  "Dubbing",
];

export function UseCasesSection() {
  return (
    <section className="bg-[#030303] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-voxar-text-muted">
          Built for Creators Who Ship
        </h2>
        <Ticker items={useCaseItems} speed="35s" />
      </div>
    </section>
  );
}
