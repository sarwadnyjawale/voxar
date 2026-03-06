interface TickerProps {
  items: string[];
  speed?: string;
}

export function Ticker({ items, speed = "30s" }: TickerProps) {
  return (
    <div className="overflow-hidden glass-card py-4">
      <div
        className="ticker-track flex w-max items-center gap-8"
        style={{ "--ticker-speed": speed } as React.CSSProperties}
      >
        {/* Duplicate for seamless loop */}
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span className="text-sm text-voxar-text-secondary">{item}</span>
            <span className="h-1 w-1 rounded-full bg-voxar-violet opacity-50" />
          </span>
        ))}
      </div>
    </div>
  );
}
