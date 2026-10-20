"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Handshake, HeartHandshake, Landmark, Layers, Map as MapIcon, ShieldCheck, Users } from "lucide-react";
import { cx } from "@/components/ui";
import { useSceneValue } from "@/lib/tour";
import { LogoIcon } from "@/components/logo";

type Metric = { value: number; prefix?: string; suffix?: string; decimals?: number; label: string; note: string };

const COLUMNS: { id: string; title: string; subtitle: string; icon: typeof Users; tone: string; metrics: Metric[] }[] = [
  {
    id: "familie",
    title: "Family",
    subtitle: "Maria and her children",
    icon: HeartHandshake,
    tone: "bg-rose-50 text-rose-700",
    metrics: [
      { value: 14, prefix: "+", suffix: " months", label: "longer at home", note: "Through earlier home care, home adaptations and a personal alarm." },
      { value: 165, prefix: "€", suffix: "/month", label: "care costs after allowances", note: "Maria: down from €248, through the care allowance and hospitalisation cover." },
      { value: 6, suffix: " hrs/week", label: "less coordination time", note: "Care, bills and appointments in one place, instead of separate apps and calls." },
      { value: 2450, prefix: "€", label: "fraud prevented", note: "Maria's own rule alerted Sarah and Ann in time." },
    ],
  },
  {
    id: "kbc",
    title: "KBC",
    subtitle: "Lending, insurance and fee income",
    icon: Landmark,
    tone: "bg-brand-soft text-navy",
    metrics: [
      { value: 56, prefix: "€", suffix: "M", label: "renovation loans", note: "Stair lifts, bathrooms and home adaptations. About 8,200 loans a year." },
      { value: 12400, prefix: "+", label: "insurance policies", note: "Hospital Care, home and family liability, offered when the need arises." },
      { value: 3.8, prefix: "€", suffix: "M", decimals: 1, label: "referral fees", note: "Per year, paid by partners for qualified requests." },
      { value: 2.1, prefix: "€", suffix: "bn", decimals: 1, label: "assets retained", note: "The children already bank with KBC when the inheritance is settled." },
      { value: 18, suffix: "%", label: "guests become customers", note: "Within 12 months. Guests like Tom can use the Mantel without being a KBC customer." },
      { value: 9.6, prefix: "€", suffix: "M", decimals: 1, label: "fraud losses avoided", note: "Per year, among customers aged 75+, through rules set by the parent." },
      { value: 3.4, suffix: "×", decimals: 1, label: "app sessions per carer", note: "Carers open KBC Mobile weekly rather than monthly." },
    ],
  },
  {
    id: "partners",
    title: "Partners",
    subtitle: "Wit-Gele Kruis, Farmaline, care home groups",
    icon: Handshake,
    tone: "bg-emerald-50 text-emerald-700",
    metrics: [
      { value: 46000, label: "qualified leads a year", note: "With context: region, care need and the parent's consent." },
      { value: 38, suffix: "%", label: "conversion", note: "Compared with about 9% through traditional channels." },
      { value: 62, prefix: "−", suffix: "%", label: "acquisition cost", note: "Requests come in through KBC when a need arises, without marketing campaigns." },
      { value: 4, suffix: " days", label: "faster start", note: "From first request to first home visit or delivery." },
    ],
  },
];

const TEMPLATES = [
  "Parent living alone",
  "After a hospital stay",
  "Early-stage dementia",
  "Moving into a care home",
  "After the death of a partner",
  "Child with care needs",
];

export default function KbcView() {
  const [tabLocal, setTab] = useState<"win" | "scale">("win");
  const tab = useSceneValue<"win" | "scale">("kbc.tab") ?? tabLocal;

  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link href="/app" className="inline-flex items-center gap-1 text-sm font-semibold text-navy">
            <ArrowLeft className="size-4" aria-hidden /> Customer view
          </Link>
          <span className="flex items-center gap-2 text-sm font-bold text-navy">
            <LogoIcon className="size-7" />
            KBC view
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 rounded-full bg-canvas p-1 text-sm font-semibold" role="tablist">
          {(
            [
              ["win", "Value"],
              ["scale", "Scale"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cx("rounded-full py-1.5 transition-colors", tab === id ? "bg-navy text-white" : "text-muted hover:text-navy")}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 pb-10 pt-6">{tab === "win" ? <TripleWin /> : <Scale />}</main>
    </div>
  );
}

function TripleWin() {
  const [openLocal, setOpen] = useState("familie");
  const open = useSceneValue<string>("kbc.open") ?? openLocal;
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Value</p>
      <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-ink">What KBC Mantel brings families, KBC and partners</h1>
      <p className="mt-3 text-sm text-muted">Because the parent decides who has access, families are comfortable arranging care and money through KBC.</p>

      <div className="mt-5 space-y-3">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const isOpen = open === col.id;
          return (
            <section key={col.id} data-tour={`kbc-${col.id}`} className="rounded-3xl bg-canvas p-4">
              <button type="button" onClick={() => setOpen(isOpen ? "" : col.id)} className="flex w-full items-center gap-3 text-left" aria-expanded={isOpen}>
                <span className={cx("flex size-11 shrink-0 items-center justify-center rounded-2xl", col.tone)}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-ink">{col.title}</span>
                  <span className="block truncate text-xs text-muted">{col.subtitle}</span>
                </span>
                <span className="text-right text-lg font-bold tabular-nums text-navy">
                  <CountUp metric={col.metrics[0]} />
                </span>
              </button>
              {isOpen && (
                <ul className="mt-4 space-y-2">
                  {col.metrics.map((m) => (
                    <li key={m.label} className="rounded-2xl bg-white p-3.5 ring-1 ring-line/70">
                      <p className="text-2xl font-bold tabular-nums tracking-tight text-navy">
                        <CountUp metric={m} />
                      </p>
                      <p className="text-sm font-semibold text-ink">{m.label}</p>
                      <p className="mt-0.5 text-xs text-muted">{m.note}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      <p className="mt-5 text-[11px] text-faint">Indicative demo figures, based on 150,000 active Mantels. Not actual KBC data.</p>
    </>
  );
}

function Scale() {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Scale</p>
      <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-ink">How KBC Mantel scales</h1>
      <p className="mt-3 text-sm text-muted">Maria’s Mantel is set up from a standard template of roles, rules, insights and regional partners.</p>

      <section className="mt-5 rounded-3xl bg-navy p-5 text-white">
        <h2 className="text-sm font-semibold text-white/70">Roll-out (indicative)</h2>
        <div className="mt-4 space-y-4">
          {[
            { year: "Year 1", value: 25000, label: "Mantels in Flanders" },
            { year: "Year 3", value: 150000, label: "Mantels in Belgium" },
            { year: "Year 5", value: 400000, label: "Mantels across KBC Group" },
          ].map((r) => (
            <div key={r.year} className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-brand">{r.year}</p>
                <p className="text-sm text-white/75">{r.label}</p>
              </div>
              <p className="text-3xl font-bold tabular-nums">
                <CountUp metric={{ value: r.value, label: r.label, note: "" }} />
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          {[
            { icon: Users, text: "On average 3.2 people per Mantel, across three households." },
            { icon: ShieldCheck, text: "The same roles and consent rules apply in every Mantel." },
            { icon: MapIcon, text: "Partner catalogue per region, connected through one API." },
            { icon: Layers, text: "The same insight models are used for all customers." },
          ].map(({ icon: Icon, text }) => (
            <p key={text} className="flex items-start gap-3 rounded-2xl bg-white/[0.07] p-3 text-sm">
              <Icon className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden /> {text}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-canvas p-5">
        <h2 className="flex items-center gap-2 font-bold text-ink">
          <Copy className="size-4 text-navy" aria-hidden /> Templates
        </h2>
        <p className="mt-1 text-xs text-muted">Each situation is set up from a template. No new app is needed.</p>
        <ul className="mt-4 space-y-2">
          {TEMPLATES.map((t, i) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line/70">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-navy">{i + 1}</span>
              <span className="text-sm font-semibold text-ink">{t}</span>
              {i === 0 && <span className="ml-auto rounded-full bg-navy px-2 py-0.5 text-[11px] font-semibold text-white">Maria</span>}
              {i === 3 && <span className="ml-auto rounded-full bg-navy px-2 py-0.5 text-[11px] font-semibold text-white">Jozef</span>}
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-5 text-[11px] text-faint">Indicative demo figures. Not actual KBC data.</p>
    </>
  );
}

function CountUp({ metric }: { metric: Metric }) {
  const [v, setV] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setV(metric.value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [metric.value]);
  const text = v.toLocaleString("en-GB", { minimumFractionDigits: metric.decimals ?? 0, maximumFractionDigits: metric.decimals ?? 0 });
  return (
    <>
      {metric.prefix}
      {text}
      {metric.suffix}
    </>
  );
}
