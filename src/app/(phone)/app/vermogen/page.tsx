"use client";

import Link from "next/link";
import { ArrowRight, Banknote, HandCoins, House, Landmark, LineChart, Shield, Sparkles } from "lucide-react";
import { ASSETS, RECURRING, poss } from "@/lib/data";
import { euro, euro0 } from "@/lib/format";
import { useCurrent } from "@/lib/use-current";
import { CareCostChart } from "@/components/care-cost-chart";
import { Card, LockedNotice, SectionTitle, WhyThis } from "@/components/ui";

const GROUP_ICON: Record<string, typeof House> = {
  Rekeningen: Banknote,
  Beleggingen: LineChart,
  Verzekeringen: Shield,
  Kredieten: Landmark,
};

export default function AssetsPage() {
  const { elder, elderPerson, canView, link } = useCurrent();
  const name = elderPerson.firstName;

  if (!link || !canView) {
    return (
      <LockedNotice
        title="Vermogen is niet gedeeld met u"
        body={`${name} koos zelf wie ${poss(elder)} rekeningen en vermogen mag zien. Met uw rol ziet u dit niet. Zo blijft ${poss(elder)} privacy beschermd.`}
      />
    );
  }

  const a = ASSETS[elder];
  const liquid = a.groups.flatMap((g) => g.items).reduce((sum, i) => sum + (i.value ?? 0), 0);
  const total = liquid + a.home.value;
  const recurring = RECURRING[elder].reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <h1 className="px-1 text-2xl font-bold tracking-tight">Vermogen van {name}</h1>
      <p className="mt-1 px-1 text-sm text-muted">Alleen-lezen. Gedeeld door {name} via uw rol.</p>

      <Card className="mt-4 bg-gradient-to-br from-navy to-navy-soft text-white ring-0">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">Totaal (indicatief)</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">{euro0(total)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-white/60">Woning</p>
            <p className="font-semibold tabular-nums">{euro0(a.home.value)}</p>
          </div>
          <div>
            <p className="text-white/60">Rekeningen & beleggingen</p>
            <p className="font-semibold tabular-nums">{euro0(liquid)}</p>
          </div>
        </div>
      </Card>

      <SectionTitle>Woning</SectionTitle>
      <Card className="space-y-2">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-navy">
            <House className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{a.home.name}</p>
            <p className="text-xs text-muted">{a.home.detail}</p>
          </div>
          <p className="font-bold tabular-nums text-ink">{euro0(a.home.value)}</p>
        </div>
        <p className="text-xs text-muted">{a.home.note}</p>
      </Card>

      {a.groups.map((g) => {
        const Icon = GROUP_ICON[g.title] ?? Banknote;
        return (
          <div key={g.title}>
            <SectionTitle>{g.title}</SectionTitle>
            <Card className="divide-y divide-line p-1.5">
              {g.items.map((i) => (
                <div key={i.name} className="flex items-center gap-3 p-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-navy">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{i.name}</span>
                    <span className="block truncate text-xs text-muted">{i.detail}</span>
                  </span>
                  <span className="text-right">
                    {i.value !== undefined && <span className="block text-sm font-bold tabular-nums text-ink">{euro(i.value)}</span>}
                    {i.trend && <span className="block text-[11px] font-semibold text-calm">{i.trend}</span>}
                    {i.note && <span className="block text-[11px] font-semibold text-muted">{i.note}</span>}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        );
      })}

      <SectionTitle>Zorgkosten per maand</SectionTitle>
      <Card>
        <CareCostChart elder={elder} />
        <div className="mt-4 border-t border-line pt-3">
          <WhyThis label="Hoe kan dit lager?">
            {elder === "maria" ? (
              <p>
                Maria kan recht hebben op het <strong>zorgbudget voor ouderen met een zorgnood</strong> (tot ca. €140 per maand). Nazorg na haar opname kan gedekt zijn door haar
                hospitalisatieverzekering.
              </p>
            ) : (
              <p>
                Jozef kan recht hebben op het <strong>zorgbudget voor zwaar zorgbehoevenden</strong> (ca. €140 per maand). Met de familie bekijken we ook kortverblijf.
              </p>
            )}
          </WhyThis>
        </div>
      </Card>

      <SectionTitle>Vaste zorgkosten</SectionTitle>
      <Card className="divide-y divide-line p-1.5">
        {RECURRING[elder].map((r) => (
          <div key={r.name} className="flex items-center gap-3 p-2.5">
            <HandCoins className="size-4 shrink-0 text-muted" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{r.name}</span>
              <span className="block text-xs text-muted">{r.detail}</span>
            </span>
            <span className="text-sm font-bold tabular-nums">{euro(r.amount)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between p-2.5 text-sm">
          <span className="font-semibold text-muted">Totaal per maand</span>
          <span className="font-bold tabular-nums text-ink">{euro(recurring)}</span>
        </div>
        <div className="flex items-center justify-between p-2.5 text-sm">
          <span className="text-muted">Inkomen (pensioen)</span>
          <span className="font-semibold tabular-nums text-ink">{euro(a.monthlyIncome)}</span>
        </div>
      </Card>

      <Link href="/app/diensten" className="mt-4 flex items-center gap-3 rounded-[var(--radius-card)] bg-brand-soft p-4 text-navy">
        <Sparkles className="size-5 shrink-0" aria-hidden />
        <span className="flex-1 text-sm font-semibold">Bekijk diensten die passen bij {name}&rsquo;s situatie</span>
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
