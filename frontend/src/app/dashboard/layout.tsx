"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Mic,
  AudioLines,
  Dna,
  Library,
  History,
  Settings,
  FileCode,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUsageStore } from "@/stores";
import { useState, useEffect } from "react";

const navSections = [
  {
    label: "Create",
    items: [
      { label: "Text to Speech", href: "/dashboard/tts", icon: Mic },
      { label: "Transcribe", href: "/dashboard/transcribe", icon: AudioLines },
      { label: "Voice Cloning", href: "/dashboard/voices/clone", icon: Dna },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Voice Library", href: "/dashboard/voices", icon: Library },
      { label: "Usage & History", href: "/dashboard/history", icon: History },
    ],
  },
];

const bottomItems = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "API Docs", href: "/docs", icon: FileCode },
  { label: "Help", href: "#", icon: HelpCircle },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-voxar-text-muted transition-colors hover:bg-voxar-surface-hover hover:text-voxar-text"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

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
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="VOXAR"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="text-base font-bold text-voxar-text">VOXAR</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-voxar-text-muted lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dashboard link */}
      <div className="px-3 pt-2">
        <Link
          href="/dashboard"
          onClick={onClose}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === "/dashboard"
              ? "bg-voxar-violet/10 text-voxar-violet font-medium"
              : "text-voxar-text-secondary hover:bg-voxar-surface-hover hover:text-voxar-text"
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-voxar-text-muted">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-voxar-violet/10 text-voxar-violet font-medium"
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
          </div>
        ))}
      </nav>

      {/* Usage meters */}
      <div className="border-t border-voxar-border/30 px-4 py-3">
        <div className="rounded-lg bg-voxar-surface-hover p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-voxar-text capitalize">
              {plan} Plan
            </span>
            <Link
              href="/pricing"
              className="text-voxar-violet hover:text-voxar-violet-glow text-[10px]"
            >
              Upgrade
            </Link>
          </div>

          <div className="mt-2.5 space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-voxar-text-muted">
                <span>TTS</span>
                <span>
                  {ttsMinutesUsed} / {ttsMinutesLimit} min
                </span>
              </div>
              <Progress value={ttsPercent} className="mt-1 h-1" />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-voxar-text-muted">
                <span>STT</span>
                <span>
                  {sttMinutesUsed} / {sttMinutesLimit} min
                </span>
              </div>
              <Progress value={sttPercent} className="mt-1 h-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div className="border-t border-voxar-border/30 px-3 py-2">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs transition-colors ${
              pathname === item.href
                ? "text-voxar-violet font-medium"
                : "text-voxar-text-muted hover:text-voxar-text"
            }`}
          >
            <item.icon size={15} />
            {item.label}
          </Link>
        ))}
        <div className="flex items-center justify-between px-3 py-1.5">
          <button className="flex items-center gap-3 text-xs text-voxar-text-muted transition-colors hover:text-voxar-error">
            <LogOut size={15} />
            Logout
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    tts: "Text to Speech",
    transcribe: "Transcribe",
    voices: "Voice Library",
    clone: "Voice Cloning",
    history: "Usage & History",
    settings: "Settings",
  };

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {segments.map((segment, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-voxar-text-muted">/</span>}
          <span
            className={
              i === segments.length - 1
                ? "font-medium text-voxar-text"
                : "text-voxar-text-muted"
            }
          >
            {labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)}
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
      <aside className="hidden w-60 flex-shrink-0 border-r border-voxar-border/30 bg-voxar-surface lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 h-full bg-voxar-surface">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-12 items-center justify-between border-b border-voxar-border/30 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="text-voxar-text-muted lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-voxar-text-muted transition-colors hover:bg-voxar-surface-hover hover:text-voxar-text">
              <Bell size={16} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-voxar-violet" />
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-voxar-violet/30 to-voxar-cyan/30">
              <span className="text-[10px] font-semibold text-voxar-text">U</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
