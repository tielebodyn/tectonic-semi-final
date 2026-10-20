"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, KeyRound, RotateCcw } from "lucide-react";
import { actions } from "@/lib/store";
import { TOURS, startTour } from "@/lib/tour";
import { Avatar, toast } from "@/components/ui";

const TONES = ["bg-rose-50 text-rose-700", "bg-brand-soft text-navy", "bg-calm-soft text-calm"];

export default function PathPicker() {
  const router = useRouter();

  return (
    <div className="flex min-h-full flex-col bg-white px-5 pb-8 pt-6">
      <div className="flex items-center gap-2.5 text-navy">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-navy text-white">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <span className="text-lg font-bold">KBC Mantel</span>
      </div>

      <h1 className="mt-8 text-[28px] font-bold leading-[1.15] tracking-tight text-ink">
        Samen zorgen. <span className="text-brand">De ouder houdt de sleutel.</span>
      </h1>
      <p className="mt-3 text-[15px] text-muted">Kies een pad en klik zelf door de app. Een gids onderaan toont telkens wat u kan aantikken.</p>

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
                  <span className="text-xs font-semibold text-muted">{t.steps.length} stappen · ± 1 min</span>
                </span>
              </span>
              <ArrowRight className="mt-3 size-5 shrink-0 text-navy transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-auto flex items-center justify-between gap-3 pt-8">
        <Link href="/kbc" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
          <BarChart3 className="size-4" aria-hidden /> KBC-zicht
        </Link>
        <button
          type="button"
          onClick={() => {
            actions.reset();
            toast("De demo staat terug op nul.");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted"
        >
          <RotateCcw className="size-4" aria-hidden /> Opnieuw beginnen
        </button>
      </div>
    </div>
  );
}
