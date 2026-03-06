import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hero?: boolean;
}

export function GlassCard({ children, className, hero }: GlassCardProps) {
  return (
    <div
      className={cn(
        hero ? "glass-card-hero" : "glass-card",
        className
      )}
    >
      {children}
    </div>
  );
}
