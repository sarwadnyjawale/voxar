import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-voxar-bg px-4">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="animate-pulse-glow">
          <Image
            src="/logo2.png"
            alt="VOXAR"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <span className="text-2xl font-bold text-voxar-text">VOXAR</span>
      </Link>

      {/* 404 */}
      <h1 className="text-8xl font-bold bg-gradient-to-r from-voxar-violet to-voxar-violet-glow bg-clip-text text-transparent">
        404
      </h1>

      <h2 className="mt-4 text-xl font-semibold text-voxar-text">
        Page not found
      </h2>

      <p className="mt-2 text-sm text-voxar-text-secondary max-w-md text-center">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="mt-8 flex gap-3">
        <Button
          asChild
          className="bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
        >
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      {/* Fun waveform */}
      <div className="mt-16 flex items-end gap-1 h-8 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-voxar-violet"
            style={{
              height: `${20 + Math.sin(i * 0.5) * 60}%`,
              animation: `waveform ${1 + Math.random()}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
