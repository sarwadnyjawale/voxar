"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore((s) => s.signup);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);
    signup(name, email, password);
    setLoading(false);
    router.push("/dashboard");
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

      <h1 className="text-2xl font-bold text-voxar-text">Create your account</h1>
      <p className="mt-1 text-sm text-voxar-text-secondary">
        Start with 3 minutes of free AI voice generation
      </p>

      <Button
        variant="outline"
        className="mt-6 w-full border-voxar-border bg-voxar-surface hover:bg-voxar-surface-hover"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-voxar-border" />
        <span className="text-xs text-voxar-text-muted">or</span>
        <div className="h-px flex-1 bg-voxar-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-voxar-text-secondary">
            Full Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className="mt-1 border-voxar-border bg-voxar-surface focus:border-voxar-violet"
          />
        </div>

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

        <div>
          <Label htmlFor="password" className="text-voxar-text-secondary">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            required
            minLength={8}
            className="mt-1 border-voxar-border bg-voxar-surface focus:border-voxar-violet"
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-voxar-border accent-voxar-violet"
          />
          <label htmlFor="terms" className="text-xs text-voxar-text-muted">
            I agree to the{" "}
            <Link href="/terms" className="text-voxar-violet hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-voxar-violet hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading || !agreed}
          className="w-full bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-voxar-text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-voxar-violet hover:text-voxar-violet-glow"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
