"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_ENTRIES } from "@/mocks/entries";
import { CATEGORY_LABELS } from "@/types/entry";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { BottomNav } from "@/components/layout/BottomNav";

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number>(11);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const formatDate = (day: number) => `2026-11-${String(day).padStart(2, "0")}`;
  const dayEntries = MOCK_ENTRIES.filter((e) => e.date === formatDate(selectedDay));

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <header className="border-b border-paper-border px-5 py-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          Timeline
        </span>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-ink">November 2026</h1>
          <div className="flex gap-2 text-sm text-ink-muted">
            <button className="rounded-lg border border-paper-border px-2.5 py-1">‹</button>
            <button className="rounded-lg border border-paper-border px-2.5 py-1">›</button>
          </div>
        </div>
      </header>

      <main className="px-5 pt-5">
        <Card>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-subtle">
            {WEEK_DAYS.map((d, idx) => (
              <div key={idx} className="py-1">{d}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 text-center">
            {days.map((day) => {
              const hasEntry = MOCK_ENTRIES.some((e) => e.date === formatDate(day));
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex h-10 flex-col items-center justify-center rounded-xl text-sm transition ${
                    isSelected
                      ? "bg-brand font-bold text-white"
                      : "text-ink hover:bg-paper-subtle"
                  }`}
                >
                  <span>{day}</span>
                  {hasEntry && (
                    <span
                      className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-accent"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <section className="mt-6 flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Entries on November {selectedDay}
          </h2>

          {dayEntries.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-paper-border p-6 text-center text-sm text-ink-subtle">
              No cultural activities logged on this day.
            </p>
          ) : (
            dayEntries.map((entry) => (
              <Link key={entry.id} href={`/entries/${entry.id}`}>
                <Card>
                  <CardHeader>
                    <Badge variant={entry.category} className="w-fit">
                      {CATEGORY_LABELS[entry.category]}
                    </Badge>
                    <CardTitle className="mt-1">{entry.title}</CardTitle>
                  </CardHeader>
                  <CardContent>{entry.creatorOrVenue}</CardContent>
                </Card>
              </Link>
            ))
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}