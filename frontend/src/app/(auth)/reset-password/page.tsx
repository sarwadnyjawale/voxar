"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    setLoading(true);
    // Phase 9: real implementation
    setLoading(false);
    router.push("/login");
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

      <h1 className="text-2xl font-bold text-voxar-text">Set new password</h1>
      <p className="mt-1 text-sm text-voxar-text-secondary">
        Enter your new password below
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="password" className="text-voxar-text-secondary">
            New Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            minLength={8}
            className="mt-1 border-voxar-border bg-voxar-surface focus:border-voxar-violet"
          />
        </div>

        <div>
          <Label htmlFor="confirm" className="text-voxar-text-secondary">
            Confirm Password
          </Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={8}
            className="mt-1 border-voxar-border bg-voxar-surface focus:border-voxar-violet"
          />
          {password && confirm && password !== confirm && (
            <p className="mt-1 text-xs text-voxar-error">
              Passwords do not match
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || password !== confirm}
          className="w-full bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
        >
          {loading ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
