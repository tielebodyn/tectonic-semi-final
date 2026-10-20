"use client";

import Link from "next/link";
import { ArrowRight, Banknote, HandCoins, House, Landmark, LineChart, Shield, Sparkles } from "lucide-react";
import { ASSETS, RECURRING, poss } from "@/lib/data";
import { euro, euro0 } from "@/lib/format";
import { useCurrent } from "@/lib/use-current";
import { CareCostChart } from "@/components/care-cost-chart";
import { Card, LockedNotice, SectionTitle, WhyThis } from "@/components/ui";

const GROUP_ICON: Record<string, typeof House> = {
  Accounts: Banknote,
  Investments: LineChart,
  Insurance: Shield,
  Loans: Landmark,
};

export default function AssetsPage() {
  const { elder, elderPerson, canView, link } = useCurrent();
  const name = elderPerson.firstName;

  if (!link || !canView) {
    return (
      <LockedNotice
        title="Finances aren't shared with you"
        body={`${name} chose who can see ${poss(elder)} accounts and assets. Your role doesn’t include access to them.`}
      />
    );
  }

  const a = ASSETS[elder];
  const liquid = a.groups.flatMap((g) => g.items).reduce((sum, i) => sum + (i.value ?? 0), 0);
  const total = liquid + a.home.value;
  const recurring = RECURRING[elder].reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <h1 className="px-1 text-2xl font-bold tracking-tight">{name}&rsquo;s finances</h1>
      <p className="mt-1 px-1 text-sm text-muted">Read only. Shared by {name} through your role.</p>

      <Card className="mt-4 bg-gradient-to-br from-navy to-navy-soft text-white ring-0">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">Total (indicative)</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">{euro0(total)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-white/60">Home</p>
            <p className="font-semibold tabular-nums">{euro0(a.home.value)}</p>
          </div>
          <div>
            <p className="text-white/60">Accounts & investments</p>
            <p className="font-semibold tabular-nums">{euro0(liquid)}</p>
          </div>
        </div>
      </Card>

      <SectionTitle>Home</SectionTitle>
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

      <SectionTitle>Care costs per month</SectionTitle>
      <Card data-tour="care-costs">
        <CareCostChart elder={elder} />
        <div className="mt-4 border-t border-line pt-3">
          <WhyThis label="Can these costs come down?">
            {elder === "maria" ? (
              <p>
                Maria may be entitled to the <strong>care allowance for older people with care needs</strong> (up to about €140 a month). Aftercare after her hospital stay may be
                covered by her KBC Hospitalisation Insurance.
              </p>
            ) : (
              <p>
                Jozef may be entitled to the <strong>care allowance for high care needs</strong> (about €140 a month). A short stay in a care home is also worth looking at with the family.
              </p>
            )}
          </WhyThis>
        </div>
      </Card>

      <SectionTitle>Regular care costs</SectionTitle>
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
          <span className="font-semibold text-muted">Total per month</span>
          <span className="font-bold tabular-nums text-ink">{euro(recurring)}</span>
        </div>
        <div className="flex items-center justify-between p-2.5 text-sm">
          <span className="text-muted">Income (pension)</span>
          <span className="font-semibold tabular-nums text-ink">{euro(a.monthlyIncome)}</span>
        </div>
      </Card>

      <Link href="/app/diensten" className="mt-4 flex items-center gap-3 rounded-[var(--radius-card)] bg-brand-soft p-4 text-navy">
        <Sparkles className="size-5 shrink-0" aria-hidden />
        <span className="flex-1 text-sm font-semibold">See services that suit {name}&rsquo;s situation</span>
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
