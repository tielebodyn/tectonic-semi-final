"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Handshake, HeartHandshake, KeyRound, Landmark, Layers, Map as MapIcon, ShieldCheck, Users } from "lucide-react";
import { cx } from "@/components/ui";

type Metric = { value: number; prefix?: string; suffix?: string; decimals?: number; label: string; note: string };

const COLUMNS: { id: string; title: string; subtitle: string; icon: typeof Users; tone: string; metrics: Metric[] }[] = [
  {
    id: "familie",
    title: "Familie",
    subtitle: "Rust, tijd en langer thuis",
    icon: HeartHandshake,
    tone: "bg-rose-50 text-rose-700",
    metrics: [
      { value: 14, prefix: "+", suffix: " mnd", label: "langer thuis wonen", note: "Door tijdige thuiszorg, woningaanpassing en een personenalarm." },
      { value: 165, prefix: "€", suffix: "/mnd", label: "zorgkost na premies", note: "Van €248 naar €165 voor Maria, dankzij zorgbudget en hospitalisatiedekking." },
      { value: 6, suffix: " u/week", label: "coördinatie bespaard", note: "Eén plek voor zorg, facturen en afspraken in plaats van tien apps en telefoontjes." },
      { value: 2450, prefix: "€", label: "fraude voorkomen", note: "Maria's eigen regel verwittigde Sarah en Ann op tijd." },
    ],
  },
  {
    id: "kbc",
    title: "KBC",
    subtitle: "Groei vanuit vertrouwen",
    icon: Landmark,
    tone: "bg-brand-soft text-navy",
    metrics: [
      { value: 56, prefix: "€", suffix: " M", label: "renovatieleningen", note: "Trapliften, badkamers en woningaanpassingen, ca. 8.200 leningen per jaar." },
      { value: 12400, prefix: "+", label: "verzekeringen", note: "Hospital Care, woon- en familiale polissen, op het juiste moment aangeboden." },
      { value: 3.8, prefix: "€", suffix: " M", decimals: 1, label: "doorverwijsvergoedingen", note: "Van partners voor gekwalificeerde aanvragen, per jaar." },
      { value: 2.1, prefix: "€", suffix: " mia", decimals: 1, label: "vermogen blijft in de familie", note: "Een vertrouwde relatie met de volgende generatie, vóór de erfenis." },
      { value: 18, suffix: "%", label: "gasten worden klant", note: "Tom leert KBC kennen zonder verplichting, binnen 12 maanden." },
      { value: 9.6, prefix: "€", suffix: " M", decimals: 1, label: "fraudeverlies vermeden", note: "Per jaar, bij klanten van 75+, dankzij regels van de ouder zelf." },
      { value: 3.4, suffix: "×", decimals: 1, label: "meer app-gebruik", note: "Mantelzorgers openen de app wekelijks, niet maandelijks." },
    ],
  },
  {
    id: "partners",
    title: "Partners",
    subtitle: "Wit-Gele Kruis, Farmaline, woonzorggroepen…",
    icon: Handshake,
    tone: "bg-emerald-50 text-emerald-700",
    metrics: [
      { value: 46000, label: "gekwalificeerde leads per jaar", note: "Met context: regio, zorgnood en toestemming van de oudere." },
      { value: 38, suffix: "%", label: "conversie", note: "Tegenover ca. 9% via klassieke kanalen, omdat de vraag echt en tijdig is." },
      { value: 62, prefix: "−", suffix: "%", label: "acquisitiekost", note: "Geen dure campagnes: KBC brengt de juiste familie op het juiste moment." },
      { value: 4, suffix: " dagen", label: "sneller opgestart", note: "Van eerste vraag tot eerste huisbezoek of levering." },
    ],
  },
];

const TEMPLATES = [
  "Ouder die alleen woont",
  "Na een ziekenhuisopname",
  "Beginnende dementie",
  "Verhuis naar een woonzorgcentrum",
  "Na het overlijden van een partner",
  "Kind met een zorgnood",
];

export default function KbcView() {
  const [tab, setTab] = useState<"win" | "scale">("win");

  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link href="/app" className="inline-flex items-center gap-1 text-sm font-semibold text-navy">
            <ArrowLeft className="size-4" aria-hidden /> Klantzicht
          </Link>
          <span className="flex items-center gap-2 text-sm font-bold text-navy">
            <span className="flex size-7 items-center justify-center rounded-lg bg-navy text-white">
              <KeyRound className="size-3.5" aria-hidden />
            </span>
            KBC-zicht
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 rounded-full bg-canvas p-1 text-sm font-semibold" role="tablist">
          {(
            [
              ["win", "Triple win"],
              ["scale", "Schaal"],
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
  const [open, setOpen] = useState("familie");
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Triple win</p>
      <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-ink">Goed voor de familie, voor KBC en voor de partners.</h1>
      <p className="mt-3 text-sm text-muted">Omdat de ouder de sleutel houdt, vertrouwt de familie KBC met de belangrijkste beslissingen.</p>

      <div className="mt-5 space-y-3">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const isOpen = open === col.id;
          return (
            <section key={col.id} className="rounded-3xl bg-canvas p-4">
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
      <p className="mt-5 text-[11px] text-faint">Indicatieve demo-cijfers bij 150.000 actieve Mantels. Geen echte KBC-data.</p>
    </>
  );
}

function Scale() {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">Schaal</p>
      <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-ink">Eén Mantel-sjabloon. Miljoenen klanten.</h1>
      <p className="mt-3 text-sm text-muted">Maria is geen maatwerk. Haar Mantel is een sjabloon: rollen, regels, signalen en partners per regio.</p>

      <section className="mt-5 rounded-3xl bg-navy p-5 text-white">
        <h2 className="text-sm font-semibold text-white/70">Uitrol (indicatief)</h2>
        <div className="mt-4 space-y-4">
          {[
            { year: "Jaar 1", value: 25000, label: "Mantels in Vlaanderen" },
            { year: "Jaar 3", value: 150000, label: "Mantels in België" },
            { year: "Jaar 5", value: 400000, label: "Mantels in de KBC-groep" },
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
            { icon: Users, text: "Gemiddeld 3,2 mensen per Mantel: één ouder, drie gezinnen bereikt." },
            { icon: ShieldCheck, text: "Toestemming is het product: overal dezelfde rollen en regels." },
            { icon: MapIcon, text: "Partnercatalogus per regio, ingeplugd via één API." },
            { icon: Layers, text: "Signaalmodellen herbruikbaar over alle klanten." },
          ].map(({ icon: Icon, text }) => (
            <p key={text} className="flex items-start gap-3 rounded-2xl bg-white/[0.07] p-3 text-sm">
              <Icon className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden /> {text}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-canvas p-5">
        <h2 className="flex items-center gap-2 font-bold text-ink">
          <Copy className="size-4 text-navy" aria-hidden /> Sjablonen
        </h2>
        <p className="mt-1 text-xs text-muted">Configuratie, geen nieuwe app per situatie.</p>
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
      <p className="mt-5 text-[11px] text-faint">Indicatieve demo-cijfers. Geen echte KBC-data.</p>
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
  const text = v.toLocaleString("nl-BE", { minimumFractionDigits: metric.decimals ?? 0, maximumFractionDigits: metric.decimals ?? 0 });
  return (
    <>
      {metric.prefix}
      {text}
      {metric.suffix}
    </>
  );
}
