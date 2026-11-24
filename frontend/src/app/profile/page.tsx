"use client";

import { signOut, useSession } from "next-auth/react";
import { MOCK_ENTRIES } from "@/mocks/entries";
import { CATEGORY_LABELS, EntryCategory } from "@/types/entry";
import { Badge, Button, Card } from "@/components/ui";
import { BottomNav } from "@/components/layout/BottomNav";

export default function ProfilePage() {
  const { data: session } = useSession();

  const total = MOCK_ENTRIES.length;
  const avgRating = (
    MOCK_ENTRIES.reduce((acc, item) => acc + item.rating, 0) / total
  ).toFixed(1);

  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <header className="flex flex-col items-center border-b border-paper-border px-5 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand font-serif text-xl font-bold text-white">
          {session?.user?.name?.[0] || "C"}
        </div>
        <h1 className="mt-3 font-serif text-xl font-bold text-ink">
          {session?.user?.name || "Cultural Explorer"}
        </h1>
        <p className="text-xs text-ink-muted">{session?.user?.email}</p>
      </header>

      <main className="flex flex-col gap-5 px-5 pt-6">
        <section className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <span className="font-serif text-2xl font-bold text-brand">{total}</span>
            <p className="mt-1 text-xs text-ink-muted">Total Entries</p>
          </Card>
          <Card className="text-center">
            <span className="font-serif text-2xl font-bold text-accent">{avgRating} ★</span>
            <p className="mt-1 text-xs text-ink-muted">Average Rating</p>
          </Card>
        </section>

        <Card>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            By Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as EntryCategory[]).map((cat) => {
              const count = MOCK_ENTRIES.filter((e) => e.category === cat).length;
              return (
                <Badge key={cat} variant={cat}>
                  {CATEGORY_LABELS[cat]}: {count}
                </Badge>
              );
            })}
          </div>
        </Card>

        <Button
          variant="outline"
          className="mt-2 w-full"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign Out
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}