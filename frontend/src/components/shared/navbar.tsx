"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(3,3,3,0.6)] backdrop-blur-[12px] border-b border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="VOXAR"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-xl font-bold text-white">VOXAR</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/#features"
            className="text-sm text-voxar-text-secondary transition-colors hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-voxar-text-secondary transition-colors hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="text-sm text-voxar-text-secondary transition-colors hover:text-white"
          >
            API Docs
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
          >
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[rgba(255,255,255,0.06)] bg-[rgba(3,3,3,0.95)] backdrop-blur-[12px] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/#features"
              className="py-2 text-sm text-voxar-text-secondary"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="py-2 text-sm text-voxar-text-secondary"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="py-2 text-sm text-voxar-text-secondary"
              onClick={() => setMobileOpen(false)}
            >
              API Docs
            </Link>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" asChild className="flex-1">
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="flex-1 bg-gradient-to-r from-voxar-violet to-purple-500"
              >
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
