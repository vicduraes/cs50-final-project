"use client";

import { useParams, useRouter } from "next/navigation";
import { MOCK_ENTRIES } from "@/mocks/entries";
import { CATEGORY_LABELS } from "@/types/entry";
import { Badge, Button, Card, CardContent } from "@/components/ui";

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const entry = MOCK_ENTRIES.find((item) => item.id === params.id) || MOCK_ENTRIES[0];

  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-6">
      <header className="flex items-center justify-between pb-6">
        <button onClick={() => router.back()} className="text-sm font-medium text-ink-muted">
          ← Back
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="danger" size="sm" onClick={() => router.push("/")}>
            Delete
          </Button>
        </div>
      </header>

      <article className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Badge variant={entry.category}>{CATEGORY_LABELS[entry.category]}</Badge>
          <span className="text-xs font-medium text-ink-muted">{entry.date}</span>
        </div>

        <h1 className="font-serif text-2xl font-bold leading-snug text-ink">
          {entry.title}
        </h1>

        <p className="text-sm font-medium text-ink-muted">{entry.creatorOrVenue}</p>

        <div className="text-base font-semibold text-accent">
          {"★".repeat(entry.rating)}{"☆".repeat(5 - entry.rating)}
          <span className="ml-2 text-xs text-ink-subtle">({entry.rating}/5)</span>
        </div>

        <Card className="mt-2">
          <CardContent>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Journal Notes
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
              {entry.notes}
            </p>
          </CardContent>
        </Card>
      </article>
    </div>
  );
}