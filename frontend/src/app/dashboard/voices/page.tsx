"use client";

import { useState } from "react";
import { Search, Play, Square, Star, Grid3X3, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const allVoices = [
  { id: "aisha", name: "Aisha", gender: "Female", languages: ["EN", "HI"], styles: ["Narration", "Conversational"], cloned: false },
  { id: "vikram", name: "Vikram", gender: "Male", languages: ["EN", "HI"], styles: ["News", "Narration"], cloned: false },
  { id: "priya", name: "Priya", gender: "Female", languages: ["EN", "HI", "TA"], styles: ["Conversational", "Storytelling"], cloned: false },
  { id: "arjun", name: "Arjun", gender: "Male", languages: ["EN", "HI", "MR"], styles: ["Narration", "Documentary"], cloned: false },
  { id: "meera", name: "Meera", gender: "Female", languages: ["EN", "HI", "BN"], styles: ["Audiobook", "Calm"], cloned: false },
  { id: "raj", name: "Raj", gender: "Male", languages: ["EN", "HI", "TE"], styles: ["News", "Professional"], cloned: false },
  { id: "ananya", name: "Ananya", gender: "Female", languages: ["EN", "HI", "KN"], styles: ["Energetic", "Marketing"], cloned: false },
  { id: "karthik", name: "Karthik", gender: "Male", languages: ["EN", "HI", "TA", "ML"], styles: ["Narration", "Calm"], cloned: false },
  { id: "deepa", name: "Deepa", gender: "Female", languages: ["EN", "HI", "GU"], styles: ["Warm", "Conversational"], cloned: false },
  { id: "ravi", name: "Ravi", gender: "Male", languages: ["EN", "HI"], styles: ["Energetic", "Ads"], cloned: false },
  { id: "sunita", name: "Sunita", gender: "Female", languages: ["EN", "HI", "PA"], styles: ["Narration", "Storytelling"], cloned: false },
  { id: "amit", name: "Amit", gender: "Male", languages: ["EN", "HI", "BN"], styles: ["Documentary", "News"], cloned: false },
  { id: "kavya", name: "Kavya", gender: "Female", languages: ["EN", "HI", "TE", "KN"], styles: ["Soft", "Audiobook"], cloned: false },
  { id: "rohan", name: "Rohan", gender: "Male", languages: ["EN", "HI", "MR"], styles: ["Conversational", "Casual"], cloned: false },
  { id: "isha", name: "Isha", gender: "Female", languages: ["EN", "HI", "TA"], styles: ["Professional", "Corporate"], cloned: false },
  { id: "dev", name: "Dev", gender: "Male", languages: ["EN", "HI", "OR"], styles: ["Narration", "Calm"], cloned: false },
  { id: "nisha", name: "Nisha", gender: "Female", languages: ["EN", "HI", "ML"], styles: ["Warm", "Storytelling"], cloned: false },
  { id: "sahil", name: "Sahil", gender: "Male", languages: ["EN", "HI", "GU", "PA"], styles: ["News", "Professional"], cloned: false },
  { id: "tara", name: "Tara", gender: "Female", languages: ["EN", "HI"], styles: ["Energetic", "Young"], cloned: false },
  { id: "varun", name: "Varun", gender: "Male", languages: ["EN", "HI", "TA", "TE"], styles: ["Deep", "Documentary"], cloned: false },
];

const clonedVoices = [
  { id: "my-voice-1", name: "My Brand Voice", gender: "Male", languages: ["EN", "HI"], styles: ["Custom"], cloned: true },
];

export default function VoiceLibraryPage() {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filtered = allVoices.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (genderFilter !== "all" && v.gender !== genderFilter) return false;
    if (langFilter !== "all" && !v.languages.includes(langFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Cloned Voices Section */}
      {clonedVoices.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-voxar-text">
              My Cloned Voices
            </h2>
            <span className="text-xs text-voxar-text-muted">
              {clonedVoices.length} / 1 cloned voices
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {clonedVoices.map((voice) => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                isPlaying={playingId === voice.id}
                isFavorite={favorites.includes(voice.id)}
                onTogglePlay={() => setPlayingId(playingId === voice.id ? null : voice.id)}
                onToggleFavorite={() => toggleFavorite(voice.id)}
              />
            ))}
            <Link
              href="/dashboard/voices/clone"
              className="flex items-center justify-center rounded-xl border-2 border-dashed border-voxar-border/50 p-6 text-sm text-voxar-text-muted transition-colors hover:border-voxar-violet/50 hover:text-voxar-violet"
            >
              + Clone New Voice
            </Link>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-voxar-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search voices..."
            className="pl-9 border-voxar-border bg-voxar-surface"
          />
        </div>

        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          className="rounded-lg border border-voxar-border bg-voxar-surface px-3 py-2 text-xs text-voxar-text focus:border-voxar-violet focus:outline-none"
        >
          <option value="all">All Languages</option>
          {["EN", "HI", "TA", "TE", "BN", "MR", "KN", "ML", "GU", "PA", "OR"].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="rounded-lg border border-voxar-border bg-voxar-surface px-3 py-2 text-xs text-voxar-text focus:border-voxar-violet focus:outline-none"
        >
          <option value="all">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <div className="flex gap-1 rounded-lg border border-voxar-border p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-voxar-surface-hover text-voxar-text" : "text-voxar-text-muted"}`}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-voxar-surface-hover text-voxar-text" : "text-voxar-text-muted"}`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Voice Grid */}
      <div className={viewMode === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" : "space-y-2"}>
        {filtered.map((voice) => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            isPlaying={playingId === voice.id}
            isFavorite={favorites.includes(voice.id)}
            onTogglePlay={() => setPlayingId(playingId === voice.id ? null : voice.id)}
            onToggleFavorite={() => toggleFavorite(voice.id)}
            listView={viewMode === "list"}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-voxar-text-muted">
          No voices match your filters.
        </div>
      )}
    </div>
  );
}

function VoiceCard({
  voice,
  isPlaying,
  isFavorite,
  onTogglePlay,
  onToggleFavorite,
  listView = false,
}: {
  voice: { id: string; name: string; gender: string; languages: string[]; styles: string[]; cloned: boolean };
  isPlaying: boolean;
  isFavorite: boolean;
  onTogglePlay: () => void;
  onToggleFavorite: () => void;
  listView?: boolean;
}) {
  if (listView) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-voxar-border/50 bg-voxar-surface p-3 transition-all hover:border-voxar-violet/30">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-voxar-violet/20 to-voxar-violet-glow/20 flex-shrink-0">
          <span className="text-xs font-semibold text-voxar-violet">{voice.name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-voxar-text">{voice.name}</span>
          <span className="ml-2 text-xs text-voxar-text-muted">{voice.gender}</span>
        </div>
        <div className="flex gap-1">
          {voice.languages.map((l) => (
            <Badge key={l} variant="secondary" className="text-[9px] h-4 bg-voxar-violet/10 text-voxar-violet-glow border-0 px-1">{l}</Badge>
          ))}
        </div>
        <span className="text-xs text-voxar-text-muted">{voice.styles.join(", ")}</span>
        <div className="flex gap-1">
          <button onClick={onTogglePlay} className="rounded p-1 text-voxar-text-muted hover:text-voxar-violet">
            {isPlaying ? <Square size={14} /> : <Play size={14} />}
          </button>
          <button onClick={onToggleFavorite} className={`rounded p-1 ${isFavorite ? "text-voxar-warning" : "text-voxar-text-muted hover:text-voxar-warning"}`}>
            <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <Button size="sm" variant="ghost" asChild className="h-7 text-xs text-voxar-violet">
            <Link href={`/dashboard/tts?voice=${voice.id}`}>Use</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-voxar-border/50 bg-voxar-surface p-4 transition-all hover:border-voxar-violet/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-voxar-violet/20 to-voxar-violet-glow/20">
            <span className="text-xs font-semibold text-voxar-violet">{voice.name[0]}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-voxar-text">{voice.name}</p>
            <p className="text-[10px] text-voxar-text-muted">{voice.gender}</p>
          </div>
        </div>
        <button
          onClick={onToggleFavorite}
          className={`${isFavorite ? "text-voxar-warning" : "text-voxar-text-muted hover:text-voxar-warning"}`}
        >
          <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {voice.cloned && (
        <Badge className="mb-2 text-[9px] bg-voxar-success/10 text-voxar-success border-0">Cloned</Badge>
      )}

      <div className="mb-2 flex flex-wrap gap-1">
        {voice.languages.map((l) => (
          <Badge key={l} variant="secondary" className="text-[9px] h-4 bg-voxar-violet/10 text-voxar-violet-glow border-0 px-1">{l}</Badge>
        ))}
      </div>

      <p className="mb-3 text-[10px] text-voxar-text-muted">{voice.styles.join(" / ")}</p>

      <div className="flex gap-2">
        <button
          onClick={onTogglePlay}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-voxar-border/30 py-1.5 text-xs text-voxar-text-secondary hover:border-voxar-violet/50 hover:text-voxar-violet"
        >
          {isPlaying ? <><Square size={10} /> Stop</> : <><Play size={10} /> Preview</>}
        </button>
        <Button size="sm" asChild className="flex-1 h-auto py-1.5 text-xs bg-gradient-to-r from-voxar-violet to-purple-500 hover:from-voxar-violet-glow hover:to-purple-400">
          <Link href={`/dashboard/tts?voice=${voice.id}`}>Use Voice</Link>
        </Button>
      </div>
    </div>
  );
}
