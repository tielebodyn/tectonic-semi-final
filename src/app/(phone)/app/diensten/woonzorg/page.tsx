"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CalendarCheck, Check, MapPin, Wallet } from "lucide-react";
import { ASSETS, CARE_HOMES, type CareHome, type CareType } from "@/lib/data";
import { euro0 } from "@/lib/format";
import { actions } from "@/lib/store";
import { useCurrent } from "@/lib/use-current";
import type { Region } from "@/lib/types";
import { Badge, Button, Card, Sheet, SuccessMark, cx, wait } from "@/components/ui";

const TYPES: CareType[] = ["Residential", "Short stay", "Day care", "Assisted living", "Dementia care"];
const BUDGETS = [
  { label: "Any budget", max: Infinity },
  { label: "up to €70/day", max: 70 },
  { label: "up to €80/day", max: 80 },
  { label: "up to €90/day", max: 90 },
];

export default function CareHomeFinderPage() {
  const { profile, elderPerson } = useCurrent();
  const [region, setRegion] = useState<Region>(profile.region);
  const [budget, setBudget] = useState(0);
  const [type, setType] = useState<CareType | null>(null);
  const [selected, setSelected] = useState<CareHome | null>(null);

  const list = CARE_HOMES.filter((h) => h.region === region)
    .filter((h) => h.priceMin <= BUDGETS[budget].max)
    .filter((h) => !type || h.types.includes(type))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div>
      <Link href="/app/diensten" className="inline-flex items-center gap-1 px-1 text-sm font-semibold text-navy">
        <ArrowLeft className="size-4" aria-hidden /> Services
      </Link>
      <h1 className="mt-2 px-1 text-2xl font-bold tracking-tight">Care homes</h1>
      <p className="mt-1 px-1 text-sm text-muted">Compare care homes and plan a visit, at {elderPerson.firstName}&rsquo;s own pace.</p>

      <Card className="mt-4 space-y-3">
        <FilterRow label="Region">
          {(["Aalst", "Ghent"] as Region[]).map((r) => (
            <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
              {r}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Budget">
          {BUDGETS.map((b, i) => (
            <Chip key={b.label} active={budget === i} onClick={() => setBudget(i)}>
              {b.label}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Type of care">
          <Chip active={type === null} onClick={() => setType(null)}>
            All
          </Chip>
          {TYPES.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)}>
              {t}
            </Chip>
          ))}
        </FilterRow>
      </Card>

      <p className="mb-2 mt-5 px-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
        {list.length} {list.length === 1 ? "result" : "results"}
      </p>
      <div className="space-y-2.5">
        {list.map((h) => (
          <button key={h.id} type="button" onClick={() => setSelected(h)} className="block w-full text-left">
            <Card className="space-y-2 transition-colors hover:bg-brand-mist/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{h.name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted">
                    <MapPin className="size-3.5" aria-hidden /> {h.city} · {h.distanceKm.toLocaleString("en-GB")} km
                  </p>
                </div>
                <p className="text-right text-sm font-bold tabular-nums text-ink">
                  €{h.priceMin}–{h.priceMax}
                  <span className="block text-[11px] font-medium text-muted">per day</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={h.availability.free ? "calm" : "attention"}>{h.availability.text}</Badge>
                {h.types.slice(0, 2).map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
                {h.types.length > 2 && <Badge>+{h.types.length - 2}</Badge>}
              </div>
            </Card>
          </button>
        ))}
        {list.length === 0 && <p className="py-8 text-center text-sm text-muted">No care homes match these filters. Try a higher budget.</p>}
      </div>

      <CareHomeSheet home={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function CareHomeSheet({ home, onClose }: { home: CareHome | null; onClose: () => void }) {
  const { s, elder, elderPerson, viewer, canView } = useCurrent();
  const [phase, setPhase] = useState<"view" | "sending" | "done">("view");
  const close = () => {
    onClose();
    setPhase("view");
  };
  if (!home) return <Sheet open={false} onClose={close}>{null}</Sheet>;

  const monthly = Math.round(((home.priceMin + home.priceMax) / 2) * 30);
  const income = ASSETS[elder].monthlyIncome;
  const savings = ASSETS[elder].groups.find((g) => g.title === "Accounts")!.items.reduce((sum, i) => sum + (i.value ?? 0), 0);
  const gap = Math.max(0, monthly - income);
  const years = gap > 0 ? Math.floor(savings / gap / 12) : null;
  const onList = s.waitlist.includes(home.id);

  return (
    <Sheet open onClose={close} title={phase === "done" ? undefined : home.name}>
      {phase === "done" ? (
        <div className="space-y-4 py-4 text-center">
          <SuccessMark />
          <h3 className="text-xl font-bold">Visit requested</h3>
          <p className="text-sm text-ink">{home.name} will contact you to plan a tour. {elderPerson.firstName} gets a notification about it too.</p>
          <Button full onClick={close}>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" aria-hidden /> {home.city} · {home.distanceKm.toLocaleString("en-GB")} km from {elderPerson.firstName}
          </p>
          <p className="text-sm text-ink">{home.description}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={home.availability.free ? "calm" : "attention"}>{home.availability.text}</Badge>
            {home.types.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-1.5 text-sm">
            {home.features.map((f) => (
              <li key={f} className="flex items-center gap-1.5">
                <Check className="size-4 text-calm" aria-hidden /> {f}
              </li>
            ))}
          </ul>

          <div className="rounded-2xl bg-canvas p-3 text-sm">
            <p className="font-semibold text-ink">
              Daily rate €{home.priceMin} – €{home.priceMax}
            </p>
            <p className="text-muted">About {euro0(monthly)} a month, extras (hairdresser, laundry) not included</p>
          </div>

          {canView && (
            <div className="space-y-2 rounded-2xl bg-brand-mist p-3 text-sm ring-1 ring-inset ring-brand/15">
              <p className="flex items-center gap-1.5 font-semibold text-navy">
                <Wallet className="size-4" aria-hidden /> Does this fit {elderPerson.firstName}&rsquo;s budget?
              </p>
              <p className="text-ink">
                Pension: {euro0(income)} a month.{" "}
                {gap > 0 ? (
                  <>
                    That leaves about <strong>{euro0(gap)}</strong> a month to top up. Savings would cover that for about <strong>{years} {years === 1 ? "year" : "years"}</strong>.
                  </>
                ) : (
                  <>The pension covers the daily rate.</>
                )}
              </p>
              <p className="text-xs text-muted">Indicative, based on what {elderPerson.firstName} shares through the Mantel.</p>
            </div>
          )}

          <Button
            full
            size="lg"
            loading={phase === "sending"}
            onClick={async () => {
              setPhase("sending");
              await wait(1100);
              actions.addToWaitlist(elder, home.id, home.name, viewer);
              setPhase("done");
            }}
          >
            <CalendarCheck className="size-4" aria-hidden /> {onList ? "Plan another visit" : "Plan a visit"}
          </Button>
        </div>
      )}
    </Sheet>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("rounded-full px-3 py-1 text-[13px] font-semibold ring-1 ring-inset transition-colors", active ? "bg-navy text-white ring-navy" : "text-navy ring-line hover:bg-brand-mist")}
    >
      {children}
    </button>
  );
}
