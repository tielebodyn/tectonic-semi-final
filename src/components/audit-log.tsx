"use client";

import { BellRing, CreditCard, KeyRound, Send, ShieldCheck, Stamp } from "lucide-react";
import { when } from "@/lib/format";
import type { AuditEntry } from "@/lib/types";
import { Avatar, cx } from "@/components/ui";

const KIND_ICON = { payment: CreditCard, request: Send, access: KeyRound, alert: BellRing, approval: Stamp, view: ShieldCheck };

export function AuditLog({ entries, large, limit }: { entries: AuditEntry[]; large?: boolean; limit?: number }) {
  const list = limit ? entries.slice(0, limit) : entries;
  if (list.length === 0) return <p className={cx("p-3 text-muted", large ? "text-lg" : "text-sm")}>Nog niets gebeurd.</p>;
  return (
    <ol className="divide-y divide-line">
      {list.map((e) => {
        const Icon = KIND_ICON[e.kind];
        return (
          <li key={e.id} className={cx("flex items-start gap-3", large ? "p-3" : "p-2.5")}>
            {e.actor === "kbc" ? (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-white">KBC</span>
            ) : (
              <Avatar id={e.actor} size="sm" />
            )}
            <div className="min-w-0 flex-1">
              <p className={cx("text-ink", large ? "text-lg leading-snug" : "text-sm")}>{e.text}</p>
              <p className={cx("mt-0.5 flex items-center gap-1 text-muted", large ? "text-base" : "text-xs")}>
                <Icon className="size-3.5" aria-hidden /> {when(e.at)}
              </p>
            </div>
            {e.amount !== undefined && (
              <span className={cx("shrink-0 font-bold tabular-nums text-ink", large ? "text-lg" : "text-sm")}>
                €{e.amount.toLocaleString("nl-BE", { minimumFractionDigits: 2 })}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
