"use client";

import Link from "next/link";
import { ArrowRight, BedDouble, Euro, Home, Hospital, Pill, ScrollText, ShoppingCart, Stethoscope, TrendingUp, X } from "lucide-react";
import type { Signal } from "@/lib/data";
import { firstName, poss } from "@/lib/data";
import { shortDate } from "@/lib/format";
import { actions } from "@/lib/store";
import { Card, WhyThis, toast } from "@/components/ui";

const ICONS = {
  nurse: Stethoscope,
  pill: Pill,
  cart: ShoppingCart,
  hospital: Hospital,
  stairs: TrendingUp,
  scroll: ScrollText,
  home: Home,
  bed: BedDouble,
  euro: Euro,
} as const;

export function SignalCard({ signal, compact }: { signal: Signal; compact?: boolean }) {
  const Icon = ICONS[signal.icon];
  const name = firstName(signal.elder);

  if (compact) {
    return (
      <Link href="/app/signalen" className="flex items-start gap-3 rounded-2xl p-2 transition-colors hover:bg-canvas">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-navy">
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-snug text-ink">{signal.title}</span>
          <span className="block text-xs text-muted">Kate noticed · {shortDate(signal.date)}</span>
        </span>
      </Link>
    );
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-navy">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">Kate noticed · {shortDate(signal.date)}</p>
          <h3 className="mt-0.5 font-bold leading-snug text-ink">{signal.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            actions.dismissSignal(signal.id);
            toast("Insight hidden.", { label: "Undo", onClick: () => actions.restoreSignal(signal.id) });
          }}
          className="-mr-1 -mt-1 rounded-full p-1.5 text-faint hover:bg-canvas hover:text-muted"
          aria-label="Hide this insight"
        >
          <X className="size-4" />
        </button>
      </div>
      <p className="text-sm text-ink">{signal.body}</p>
      <WhyThis>
        <ul className="list-disc space-y-1 pl-4">
          {signal.reason.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">
          You&rsquo;re seeing this because {name} gave you access to {poss(signal.elder)} Mantel. KBC never shares anything without {name}&rsquo;s consent.
        </p>
      </WhyThis>
      <div className="flex items-center justify-between gap-2 pt-1">
        <Link href={signal.cta.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-brand">
          {signal.cta.label} <ArrowRight className="size-4" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => {
            actions.dismissSignal(signal.id);
            toast("Insight hidden.", { label: "Undo", onClick: () => actions.restoreSignal(signal.id) });
          }}
          className="text-sm font-medium text-muted hover:text-ink"
        >
          Not now
        </button>
      </div>
    </Card>
  );
}
