"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Compass, RotateCcw } from "lucide-react";
import { actions } from "@/lib/store";
import { TOURS, startTour } from "@/lib/tour";
import type { PersonId } from "@/lib/types";
import { Avatar, toast } from "@/components/ui";
import { Logo } from "@/components/logo";

const FREE: { viewer: PersonId; href: string; title: string; subtitle: string }[] = [
  {
    viewer: "sarah",
    href: "/app",
    title: "Discover freely as a caregiver",
    subtitle: "Open the app as Sarah, with Maria’s Mantel already set up, and tap around wherever you like.",
  },
  {
    viewer: "maria",
    href: "/maria",
    title: "Discover freely as someone who needs mantelzorg",
    subtitle: "Open the app as Maria and see what she sees: who helps her, and what they may do.",
  },
];

const TONES = ["bg-rose-50 text-rose-700", "bg-brand-soft text-navy", "bg-calm-soft text-calm"];

export default function PathPicker() {
  const router = useRouter();

  return (
    <div className="flex min-h-full flex-col bg-white px-5 pb-8 pt-6">
      <div className="flex items-end justify-between">
        <Logo size="lg" />
        <span className="pb-0.5 text-xs font-semibold text-muted">by KBC</span>
      </div>

      <h1 className="mt-8 text-[28px] font-bold leading-[1.15] tracking-tight text-ink">
        Helping a parent with their <span className="text-brand">banking and care?</span>
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        With KBC Mantel, your parent decides who can help, and what they can see or do.
      </p>
      <p className="mt-2 text-[15px] text-muted">Pick a path and tap Next to play it step by step. Previous takes you back.</p>

      <ol className="mt-6 space-y-3">
        {TOURS.map((t, i) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => startTour(t.id, router)}
              className="group flex w-full items-start gap-4 rounded-3xl bg-canvas p-4 text-left ring-1 ring-transparent transition-all hover:ring-brand/40 active:scale-[0.99]"
            >
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${TONES[i]}`}>{t.id}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold leading-snug text-ink">{t.title}</span>
                <span className="mt-1 block text-sm leading-snug text-muted">{t.subtitle}</span>
                <span className="mt-3 flex items-center gap-2">
                  <span className="flex -space-x-2">
                    {t.people.map((p) => (
                      <Avatar key={p} id={p} size="sm" ring />
                    ))}
                  </span>
                  <span className="text-xs font-semibold text-muted">{t.steps.length} steps · about 2 min</span>
                </span>
              </span>
              <ArrowRight className="mt-3 size-5 shrink-0 text-navy transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </li>
        ))}
        {FREE.map((f) => (
          <li key={f.viewer}>
            <button
              type="button"
              onClick={() => {
                actions.startFree(f.viewer);
                router.push(f.href);
              }}
              className="group flex w-full items-start gap-4 rounded-3xl p-4 text-left ring-2 ring-inset ring-line transition-all hover:ring-brand/40 active:scale-[0.99]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Compass className="size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold leading-snug text-ink">{f.title}</span>
                <span className="mt-1 block text-sm leading-snug text-muted">{f.subtitle}</span>
                <span className="mt-3 flex items-center gap-2">
                  <Avatar id={f.viewer} size="sm" ring />
                  <span className="text-xs font-semibold text-muted">No script</span>
                </span>
              </span>
              <ArrowRight className="mt-3 size-5 shrink-0 text-navy transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </li>
        ))}
      </ol>

      <p className="mt-5 px-1 text-xs text-faint">
        Why “Mantel”? In Flemish, <em>mantelzorg</em> is the care that family, friends and neighbours give each other.
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-8">
        <Link href="/kbc" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
          <BarChart3 className="size-4" aria-hidden /> KBC view
        </Link>
        <button
          type="button"
          onClick={() => {
            actions.reset();
            toast("The demo has been reset.");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted"
        >
          <RotateCcw className="size-4" aria-hidden /> Start over
        </button>
      </div>
    </div>
  );
}
