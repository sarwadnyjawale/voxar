"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  AudioLines,
  Library,
  Dna,
  History,
  Settings,
  FileCode,
  HelpCircle,
  LogOut,
  ChevronUp,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUsageStore } from "@/stores";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Text to Speech", href: "/dashboard/tts", icon: Mic },
  { label: "Transcribe", href: "/dashboard/transcribe", icon: AudioLines },
  { label: "Voice Library", href: "/dashboard/voices", icon: Library },
  { label: "Voice Cloning", href: "/dashboard/voices/clone", icon: Dna },
  { label: "Usage & History", href: "/dashboard/history", icon: History },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const bottomItems = [
  { label: "API Docs", href: "/docs", icon: FileCode },
  { label: "Help & Support", href: "#", icon: HelpCircle },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const {
    ttsMinutesUsed,
    ttsMinutesLimit,
    sttMinutesUsed,
    sttMinutesLimit,
    plan,
  } = useUsageStore();

  const ttsPercent = (ttsMinutesUsed / ttsMinutesLimit) * 100;
  const sttPercent = (sttMinutesUsed / sttMinutesLimit) * 100;

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-voxar-border/30 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="VOXAR"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-lg font-bold text-voxar-text">VOXAR</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-voxar-text-muted lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-voxar-violet/10 text-voxar-violet"
                      : "text-voxar-text-secondary hover:bg-voxar-surface-hover hover:text-voxar-text"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Usage meters */}
      <div className="border-t border-voxar-border/30 px-4 py-4">
        <div className="rounded-lg bg-voxar-surface p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-voxar-text capitalize">
              {plan} Plan
            </span>
            <Link
              href="/pricing"
              className="text-voxar-violet hover:text-voxar-violet-glow"
            >
              Upgrade
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-voxar-text-muted">
                <span>TTS</span>
                <span>
                  {ttsMinutesUsed} / {ttsMinutesLimit} min
                </span>
              </div>
              <Progress
                value={ttsPercent}
                className="mt-1 h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-voxar-text-muted">
                <span>STT</span>
                <span>
                  {sttMinutesUsed} / {sttMinutesLimit} min
                </span>
              </div>
              <Progress
                value={sttPercent}
                className="mt-1 h-1.5"
              />
            </div>
          </div>

          {ttsPercent >= 80 && (
            <p className="mt-2 text-[10px] text-voxar-warning">
              You&apos;re close to your limit. Upgrade for more.
            </p>
          )}
        </div>
      </div>

      {/* Bottom links */}
      <div className="border-t border-voxar-border/30 px-3 py-3">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-voxar-text-muted transition-colors hover:text-voxar-text"
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-voxar-text-muted transition-colors hover:text-voxar-error">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {segments.map((segment, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-voxar-text-muted">/</span>}
          <span
            className={
              i === segments.length - 1
                ? "text-voxar-text"
                : "text-voxar-text-muted"
            }
          >
            {segment.charAt(0).toUpperCase() + segment.slice(1)}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-voxar-bg">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-voxar-border/30 bg-[#0d0d14] lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 h-full bg-[#0d0d14]">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-voxar-border/30 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="text-voxar-text-muted lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-voxar-text-muted hover:text-voxar-text">
              <Bell size={18} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-voxar-violet" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-voxar-violet/30 to-voxar-cyan/30">
              <span className="text-xs font-semibold text-voxar-text">U</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
