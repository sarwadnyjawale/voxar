"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Phase 9: real implementation
    setSent(true);
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-voxar-violet to-voxar-violet-glow">
            <span className="text-sm font-bold text-white">V</span>
          </div>
          <span className="text-xl font-bold text-voxar-text">VOXAR</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-voxar-text">Reset password</h1>
      <p className="mt-1 text-sm text-voxar-text-secondary">
        Enter your email and we&apos;ll send you a reset link
      </p>

      {sent ? (
        <div className="mt-6 rounded-lg border border-voxar-success/30 bg-voxar-success/10 p-4">
          <p className="text-sm text-voxar-success">
            If an account with that email exists, we&apos;ve sent a password reset
            link. Check your inbox.
          </p>
          <Link
            href="/login"
            className="mt-3 block text-sm text-voxar-violet hover:text-voxar-violet-glow"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email" className="text-voxar-text-secondary">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 border-voxar-border bg-voxar-surface focus:border-voxar-violet"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
          >
            Send reset link
          </Button>

          <p className="text-center text-sm text-voxar-text-muted">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-voxar-violet hover:text-voxar-violet-glow"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
