"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MOCK_ENTRIES } from "@/mocks/entries";
import { CATEGORY_LABELS, EntryCategory } from "@/types/entry";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { BottomNav } from "@/components/layout/BottomNav";

type SortOption = "recent" | "rating";

function formatEntryDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function HomePage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EntryCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const firstName = session?.user?.name?.split(" ")[0] || "Explorer";

  const filteredEntries = useMemo(() => {
    return MOCK_ENTRIES.filter((entry) => {
      const matchesCategory =
        selectedCategory === "all" || entry.category === selectedCategory;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        entry.title.toLowerCase().includes(query) ||
        entry.creatorOrVenue.toLowerCase().includes(query) ||
        entry.notes.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating || b.date.localeCompare(a.date);
      }
      return b.date.localeCompare(a.date);
    });
  }, [search, selectedCategory, sortBy]);

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <header className="sticky top-0 z-10 border-b border-paper-border bg-paper/95 px-5 pt-6 pb-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-muted">
              Hello, {firstName}
            </p>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-ink">
              My Journal
            </h1>
          </div>

          <Link href="/entries/new">
            <Button size="sm" variant="primary">
              + New
            </Button>
          </Link>
        </div>

        <div className="mt-3.5">
          <Input
            type="search"
            placeholder="Filter by title, creator, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search entries"
          />
        </div>

        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className="shrink-0"
          >
            <Badge
              variant={selectedCategory === "all" ? "accent" : "default"}
              className="cursor-pointer py-1 px-3"
            >
              All ({MOCK_ENTRIES.length})
            </Badge>
          </button>

          {(Object.keys(CATEGORY_LABELS) as EntryCategory[]).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="shrink-0"
              >
                <Badge
                  variant={isSelected ? cat : "default"}
                  className={`cursor-pointer py-1 px-3 ${
                    isSelected ? "ring-1 ring-ink/20 font-semibold" : ""
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </Badge>
              </button>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs text-ink-muted">
          <span>
            {filteredEntries.length}{" "}
            {filteredEntries.length === 1 ? "entry found" : "entries found"}
          </span>

          <button
            type="button"
            onClick={() => setSortBy(sortBy === "recent" ? "rating" : "recent")}
            className="font-semibold text-brand hover:underline"
          >
            Sort: {sortBy === "recent" ? "Most recent ↓" : "Top rated ★"}
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-3.5 px-5 pt-4">
        {filteredEntries.length === 0 ? (
          <Card className="mt-4 flex flex-col items-center py-10 text-center">
            <p className="font-serif text-base font-semibold text-ink">
              No entries found
            </p>
            <p className="mt-1 max-w-xs text-xs text-ink-muted">
              Try clearing your search filters or log a new cultural experience in your journal.
            </p>
            <div className="mt-4 flex gap-2">
              {(search || selectedCategory !== "all") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
              <Link href="/entries/new">
                <Button size="sm" variant="primary">
                  Create entry
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Link key={entry.id} href={`/entries/${entry.id}`}>
              <Card className="transition hover:border-brand/40 active:scale-[0.99]">
                <CardHeader className="mb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={entry.category}>
                      {CATEGORY_LABELS[entry.category]}
                    </Badge>
                    <time
                      dateTime={entry.date}
                      className="text-xs font-medium text-ink-subtle"
                    >
                      {formatEntryDate(entry.date)}
                    </time>
                  </div>

                  <CardTitle className="mt-1.5">{entry.title}</CardTitle>
                  {entry.creatorOrVenue && (
                    <p className="text-xs font-medium text-ink-muted">
                      {entry.creatorOrVenue}
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
                    {entry.notes}
                  </p>

                  <div
                    className="mt-3 flex items-center justify-between border-t border-paper-subtle pt-2.5"
                    aria-label={`Rating: ${entry.rating} out of 5 stars`}
                  >
                    <div className="flex items-center gap-0.5 text-sm text-accent">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= entry.rating ? "text-accent" : "text-paper-border"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-ink-subtle">
                      {entry.rating}.0 / 5
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}