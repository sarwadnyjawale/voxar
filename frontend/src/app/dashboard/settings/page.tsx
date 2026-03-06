"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-voxar-text mb-6">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start bg-voxar-surface border border-voxar-border/50 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="api">
          <APIKeysTab />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>

        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileTab() {
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@example.com");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
        <h3 className="text-sm font-medium text-voxar-text mb-4">
          Profile Information
        </h3>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-voxar-violet/30 to-voxar-cyan/30">
            <span className="text-xl font-bold text-voxar-text">D</span>
          </div>
          <div>
            <Button variant="outline" size="sm" className="text-xs">
              Upload Avatar
            </Button>
            <p className="mt-1 text-[10px] text-voxar-text-muted">
              JPG, PNG, max 2MB
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-voxar-text-secondary">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 border-voxar-border bg-voxar-surface-hover"
            />
          </div>
          <div>
            <Label className="text-voxar-text-secondary">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 border-voxar-border bg-voxar-surface-hover"
            />
          </div>
        </div>

        <Button className="mt-4 bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400">
          Save Changes
        </Button>
      </div>

      <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
        <h3 className="text-sm font-medium text-voxar-text mb-4">
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-voxar-text-secondary">Current Password</Label>
            <Input type="password" className="mt-1 border-voxar-border bg-voxar-surface-hover" />
          </div>
          <div>
            <Label className="text-voxar-text-secondary">New Password</Label>
            <Input type="password" className="mt-1 border-voxar-border bg-voxar-surface-hover" />
          </div>
          <div>
            <Label className="text-voxar-text-secondary">Confirm Password</Label>
            <Input type="password" className="mt-1 border-voxar-border bg-voxar-surface-hover" />
          </div>
        </div>
        <Button variant="outline" className="mt-4">
          Update Password
        </Button>
      </div>
    </div>
  );
}

function APIKeysTab() {
  const [showKey, setShowKey] = useState(false);
  const apiKey = "vx_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";
  const plan: string = "access"; // Would come from store

  if (plan !== "pro" && plan !== "enterprise") {
    return (
      <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-voxar-violet/10">
          <span className="text-2xl">🔒</span>
        </div>
        <h3 className="text-lg font-semibold text-voxar-text">
          API Access - Pro Plan Only
        </h3>
        <p className="mt-2 text-sm text-voxar-text-secondary max-w-md mx-auto">
          Programmatic API access is available exclusively on the Pro plan
          (₹4,999/month). Includes 30 req/min, 5 concurrent jobs, and dedicated queue
          priority.
        </p>
        <Button
          asChild
          className="mt-4 bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400"
        >
          <Link href="/pricing">Upgrade to Pro</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
        <h3 className="text-sm font-medium text-voxar-text mb-4">
          API Key
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type={showKey ? "text" : "password"}
            value={apiKey}
            readOnly
            className="font-mono text-xs border-voxar-border bg-voxar-surface-hover"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigator.clipboard.writeText(apiKey)}
          >
            <Copy size={14} />
          </Button>
        </div>
        <Button variant="outline" className="mt-3 text-xs">
          <RefreshCw size={12} className="mr-1.5" /> Regenerate Key
        </Button>
      </div>

      <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
        <h3 className="text-sm font-medium text-voxar-text mb-3">
          Rate Limits
        </h3>
        <div className="space-y-2 text-xs">
          {[
            ["Requests per minute", "30"],
            ["Concurrent jobs", "5"],
            ["Monthly TTS cap", "2,000 min"],
            ["Monthly STT cap", "6,000 min"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-voxar-text-muted">
              <span>{label}</span>
              <span className="text-voxar-text-secondary">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreferencesTab() {
  const [defaultLang, setDefaultLang] = useState("auto");
  const [defaultVoice, setDefaultVoice] = useState("aisha");
  const [defaultFormat, setDefaultFormat] = useState("mp3");
  const [defaultMode, setDefaultMode] = useState("flash");

  return (
    <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
      <h3 className="text-sm font-medium text-voxar-text mb-4">
        Default Settings
      </h3>
      <div className="space-y-4">
        <div>
          <Label className="text-voxar-text-secondary">Default Language</Label>
          <select
            value={defaultLang}
            onChange={(e) => setDefaultLang(e.target.value)}
            className="mt-1 w-full rounded-lg border border-voxar-border bg-voxar-surface-hover px-3 py-2 text-sm text-voxar-text focus:border-voxar-violet focus:outline-none"
          >
            <option value="auto">Auto-detect</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="bn">Bengali</option>
            <option value="mr">Marathi</option>
          </select>
        </div>

        <div>
          <Label className="text-voxar-text-secondary">Default Voice</Label>
          <select
            value={defaultVoice}
            onChange={(e) => setDefaultVoice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-voxar-border bg-voxar-surface-hover px-3 py-2 text-sm text-voxar-text focus:border-voxar-violet focus:outline-none"
          >
            <option value="aisha">Aisha</option>
            <option value="vikram">Vikram</option>
            <option value="priya">Priya</option>
            <option value="arjun">Arjun</option>
          </select>
        </div>

        <div>
          <Label className="text-voxar-text-secondary">Default Output Format</Label>
          <div className="mt-1 flex gap-2">
            {["mp3", "wav"].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setDefaultFormat(fmt)}
                className={`rounded-lg border px-4 py-2 text-xs uppercase ${
                  defaultFormat === fmt
                    ? "border-voxar-violet bg-voxar-violet/10 text-voxar-violet"
                    : "border-voxar-border text-voxar-text-muted"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-voxar-text-secondary">Default TTS Mode</Label>
          <div className="mt-1 flex gap-2">
            {["flash", "cinematic", "longform", "multilingual"].map((m) => (
              <button
                key={m}
                onClick={() => setDefaultMode(m)}
                className={`rounded-lg border px-3 py-2 text-xs capitalize ${
                  defaultMode === m
                    ? "border-voxar-violet bg-voxar-violet/10 text-voxar-violet"
                    : "border-voxar-border text-voxar-text-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button className="mt-6 bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400">
        Save Preferences
      </Button>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-voxar-text">Current Plan</h3>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs border-voxar-violet/50 text-voxar-violet hover:bg-voxar-violet/10"
          >
            <Link href="/pricing">Change Plan</Link>
          </Button>
        </div>
        <div className="rounded-lg bg-voxar-bg p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-voxar-text">VOXAR Access</span>
            <span className="text-sm text-voxar-text-muted">₹199/month</span>
          </div>
          <p className="mt-1 text-xs text-voxar-text-muted">
            Next billing date: March 18, 2026
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-5">
        <h3 className="text-sm font-medium text-voxar-text mb-4">
          Payment History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-voxar-border/30">
                <th className="pb-2 text-left text-xs font-medium text-voxar-text-muted">Date</th>
                <th className="pb-2 text-left text-xs font-medium text-voxar-text-muted">Description</th>
                <th className="pb-2 text-left text-xs font-medium text-voxar-text-muted">Amount</th>
                <th className="pb-2 text-right text-xs font-medium text-voxar-text-muted">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "Mar 3, 2026", desc: "VOXAR Access - Monthly", amount: "₹199", status: "Paid" },
                { date: "Feb 3, 2026", desc: "VOXAR Access - Monthly", amount: "₹199", status: "Paid" },
                { date: "Jan 3, 2026", desc: "VOXAR Access - Monthly", amount: "₹199", status: "Paid" },
              ].map((payment, i) => (
                <tr key={i} className="border-b border-voxar-border/20 last:border-0">
                  <td className="py-3 text-xs text-voxar-text-muted">{payment.date}</td>
                  <td className="py-3 text-xs text-voxar-text-secondary">{payment.desc}</td>
                  <td className="py-3 text-xs text-voxar-text">{payment.amount}</td>
                  <td className="py-3 text-right">
                    <button className="text-xs text-voxar-violet hover:underline">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Button variant="outline" className="text-xs text-voxar-error border-voxar-error/30 hover:bg-voxar-error/10">
        Cancel Subscription
      </Button>
    </div>
  );
}
