"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, KeyRound, Play, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { DEMO_STEPS } from "@/lib/demo-steps";
import { actions, getDemo, useDemo } from "@/lib/store";
import type { PersonId } from "@/lib/types";
import { Avatar, cx, toast } from "@/components/ui";

const PERSONAS: { id: PersonId; label: string; sub: string }[] = [
  { id: "sarah", label: "Sarah", sub: "dochter · KBC-klant" },
  { id: "tom", label: "Tom", sub: "zoon · gast" },
  { id: "ann", label: "Ann", sub: "buurvrouw · meldingen" },
  { id: "maria", label: "Maria", sub: "79 · houdt de sleutel" },
];

export function useViewAs() {
  const router = useRouter();
  return (id: PersonId) => {
    const s = getDemo();
    if (id === "maria") {
      actions.setViewer("maria", "maria");
      router.push("/maria");
      return;
    }
    if (id === "sarah") {
      actions.setViewer("sarah");
      router.push("/app");
      return;
    }
    const member = s.mantel.maria === "active" ? s.circles.maria.find((m) => m.personId === id) : undefined;
    if (!member || member.status === "revoked") {
      toast(`${id === "tom" ? "Tom" : "Ann"} is (nog) niet uitgenodigd door Maria.`);
      return;
    }
    if (member.status === "invited") {
      actions.setViewer(id, "maria");
      router.push("/gast");
      return;
    }
    actions.setViewer(id, "maria");
    router.push("/app");
  };
}

function RailContent({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { viewer } = useDemo();
  const [lastStep, setLastStep] = useState<number | null>(null);
  const viewAs = useViewAs();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" onClick={onNavigate} className="inline-flex items-center gap-2 text-navy">
          <span className="flex size-8 items-center justify-center rounded-xl bg-navy text-white">
            <KeyRound className="size-4" aria-hidden />
          </span>
          <span className="text-lg font-bold">KBC Mantel</span>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-navy">demo</span>
        </Link>
        <p className="mt-2 text-sm text-muted">De ouder houdt de sleutel.</p>
      </div>

      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Demoscenario</h3>
        <ol className="space-y-1">
          {DEMO_STEPS.map((step) => (
            <li key={step.n}>
              <button
                type="button"
                onClick={() => {
                  const href = step.run();
                  setLastStep(step.n);
                  router.push(href);
                  onNavigate?.();
                }}
                className={cx(
                  "group flex w-full items-start gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors hover:bg-white",
                  lastStep === step.n && "bg-white shadow-sm",
                )}
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{step.n}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug text-ink">{step.title}</span>
                </span>
                <Play className="ml-auto mt-1 size-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Bekijk als</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                viewAs(p.id);
                onNavigate?.();
              }}
              className={cx(
                "flex items-center gap-2 rounded-2xl px-2 py-2 text-left ring-1 ring-inset transition-colors",
                viewer === p.id ? "bg-white ring-brand" : "ring-transparent hover:bg-white",
              )}
            >
              <Avatar id={p.id} size="sm" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{p.label}</span>
                <span className="block truncate text-[11px] text-muted">{p.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/kbc"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-2xl bg-navy px-3.5 py-3 text-sm font-semibold text-white hover:bg-navy-soft"
        >
          <BarChart3 className="size-4" aria-hidden /> KBC-zicht: triple win
        </Link>
        <button
          type="button"
          onClick={() => {
            actions.reset();
            router.push("/");
            onNavigate?.();
          }}
          className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-muted ring-1 ring-inset ring-line hover:bg-white"
        >
          <RotateCcw className="size-4" aria-hidden /> Demo resetten
        </button>
      </div>
    </div>
  );
}

export function DemoRail({ className }: { className?: string }) {
  return (
    <aside className={cx("w-[280px] shrink-0 flex-col", className)}>
      <RailContent />
    </aside>
  );
}

export function MobileDemoButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-3 z-[60] flex items-center gap-1.5 rounded-full bg-navy/85 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur"
      >
        <SlidersHorizontal className="size-3.5" aria-hidden /> Demo
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-canvas p-5">
          <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full p-2 text-muted hover:bg-white" aria-label="Sluiten">
            <X className="size-5" />
          </button>
          <RailContent onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
