"use client";

import Link from "next/link";
import { ArrowRight, Check, PiggyBank } from "lucide-react";
import { SERVICES } from "@/lib/data";
import { euro0 } from "@/lib/format";
import { actions, useDemo } from "@/lib/store";
import { Card, SectionTitle, cx } from "@/components/ui";

export const CHILD_CHECKLIST = [
  { id: "c-talk", title: "Talk to Mum about what she wants", detail: "What matters to her? What would she like help with?" },
  { id: "c-erkenning", title: "Apply for official carer status", detail: "Through your health insurance fund. It gives you access to certain rights and allowances." },
  { id: "c-premie", title: "Apply for the carer's allowance", detail: "From the City of Ghent, if you care for someone regularly." },
  { id: "c-verlof", title: "Ask your employer about carer's leave", detail: "You may be entitled to leave to care for a family member." },
];

const SPENT = 64;

export function ChildSpace() {
  const { childSpace } = useDemo();
  const done = childSpace.checklist.length;

  return (
    <div>
      <SectionTitle action={<span className="text-xs font-semibold text-muted">{done}/{CHILD_CHECKLIST.length}</span>}>Your carer checklist</SectionTitle>
      <Card className="divide-y divide-line p-1.5">
        {CHILD_CHECKLIST.map((c) => {
          const checked = childSpace.checklist.includes(c.id);
          return (
            <button key={c.id} type="button" onClick={() => actions.toggleChildCheck(c.id)} className="flex w-full items-start gap-3 p-2.5 text-left">
              <span className={cx("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md ring-1 ring-inset", checked ? "bg-calm ring-calm text-white" : "ring-line")}>
                {checked && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
              </span>
              <span>
                <span className={cx("block text-sm font-semibold", checked ? "text-muted line-through" : "text-ink")}>{c.title}</span>
                <span className="block text-xs text-muted">{c.detail}</span>
              </span>
            </button>
          );
        })}
      </Card>

      <SectionTitle>Your own carer budget</SectionTitle>
      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-calm-soft text-calm">
            <PiggyBank className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Savings pot &lsquo;For Mum&rsquo;</p>
            <p className="text-xs text-muted">In your own account, for petrol, shopping or a small gift. Separate from Maria&rsquo;s money.</p>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>This month: {euro0(SPENT)}</span>
            <span>Budget: {euro0(childSpace.budget)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-canvas">
            <div className="h-full rounded-full bg-calm transition-all" style={{ width: `${Math.min(100, (SPENT / childSpace.budget) * 100)}%` }} />
          </div>
        </div>
        <div className="flex gap-2">
          {[100, 150, 250].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => actions.setChildBudget(b)}
              className={cx(
                "flex-1 rounded-full py-1.5 text-sm font-semibold ring-1 ring-inset",
                childSpace.budget === b ? "bg-navy text-white ring-navy" : "text-navy ring-line hover:bg-canvas",
              )}
            >
              {euro0(b)}
            </button>
          ))}
        </div>
      </Card>

      <SectionTitle action={<Link href="/app/diensten" className="text-xs font-semibold text-brand">View all</Link>}>Help near Ghent</SectionTitle>
      <Card className="divide-y divide-line p-1.5">
        {SERVICES.filter((x) => ["wgk", "familiehulp", "alarm"].includes(x.id)).map((x) => (
          <Link key={x.id} href="/app/diensten" className="flex items-center gap-3 p-2.5">
            <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1 ring-inset", x.tone)}>{x.monogram}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{x.partner}</span>
              <span className="block truncate text-xs text-muted">{x.name}</span>
            </span>
            <ArrowRight className="size-4 text-faint" aria-hidden />
          </Link>
        ))}
      </Card>
      <p className="mt-2 px-1 text-xs text-muted">General information for Ghent. None of Maria&rsquo;s data is used.</p>
    </div>
  );
}
