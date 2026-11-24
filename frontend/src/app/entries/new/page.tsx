"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, EntryCategory } from "@/types/entry";
import { Badge, Button, Input } from "@/components/ui";
import { BottomNav } from "@/components/layout/BottomNav";

export default function NewEntryPage() {
  const router = useRouter();
  const [category, setCategory] = useState<EntryCategory>("movie");
  const [title, setTitle] = useState("");
  const [creatorOrVenue, setCreatorOrVenue] = useState("");
  const [date, setDate] = useState("2026-11-23");
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <header className="flex items-center justify-between border-b border-paper-border px-5 py-5">
        <button onClick={() => router.back()} className="text-sm font-medium text-ink-muted">
          ← Back
        </button>
        <h1 className="font-serif text-lg font-bold text-ink">New Entry</h1>
        <span className="w-12" />
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pt-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Category
          </span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as EntryCategory[]).map((cat) => (
              <button type="button" key={cat} onClick={() => setCategory(cat)}>
                <Badge
                  variant={category === cat ? cat : "default"}
                  className={category === cat ? "ring-2 ring-brand/30" : ""}
                >
                  {CATEGORY_LABELS[cat]}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Title"
          placeholder="Movie, book, play, or concert name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Author, Director, or Venue"
          placeholder="e.g., Chimamanda Ngozi Adichie / MASP"
          value={creatorOrVenue}
          onChange={(e) => setCreatorOrVenue(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Rating
            </span>
            <div className="flex h-11 items-center justify-around rounded-xl border border-paper-border bg-paper-surface px-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-lg ${star <= rating ? "text-accent" : "text-ink-subtle"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Notes & Reflections
          </label>
          <textarea
            rows={4}
            placeholder="What stood out most about this experience?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-paper-border bg-paper-surface p-3.5 text-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <Button type="submit" size="lg" className="mt-2 w-full">
          Save to Journal
        </Button>
      </form>

      <BottomNav />
    </div>
  );
}