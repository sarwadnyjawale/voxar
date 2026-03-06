import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a0f] lg:flex">
        <div className="max-w-md px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo2.png"
              alt="VOXAR"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-2xl font-bold text-voxar-text">VOXAR</span>
          </Link>
          <h2 className="mt-8 text-3xl font-bold text-voxar-text">
            AI Voice Infrastructure for Multilingual Creators
          </h2>
          <p className="mt-4 text-voxar-text-secondary">
            Studio-grade Text-to-Speech, Voice Cloning, and Transcription across
            12 languages.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "20+ Neural AI Voices",
              "12 Indian Languages",
              "Voice Cloning from 30s samples",
              "Real-time Transcription",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-voxar-text-muted"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-voxar-violet" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full items-center justify-center bg-voxar-bg px-4 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
