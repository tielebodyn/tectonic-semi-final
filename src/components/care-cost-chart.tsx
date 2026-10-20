"use client";

import { useState } from "react";
import { CARE_COSTS } from "@/lib/data";
import { euro, euro0 } from "@/lib/format";
import type { ElderId } from "@/lib/types";
import { cx } from "@/components/ui";

// Validated categorical order (light surface): nursing, pharmacy, home help.
const SERIES = [
  { key: "nursing", label: "Home nursing", color: "#1f5fa8" },
  { key: "pharmacy", label: "Pharmacy", color: "#3fb0e0" },
  { key: "help", label: "Home help & day care", color: "#d9962b" },
] as const;

export function CareCostChart({ elder }: { elder: ElderId }) {
  const data = CARE_COSTS[elder];
  const series = SERIES.filter((s) => data.some((d) => d[s.key] > 0));
  const totals = data.map((d) => series.reduce((sum, s) => sum + d[s.key], 0));
  const max = Math.max(...totals) * 1.1;
  const [hover, setHover] = useState<number | null>(null);
  const focus = hover ?? data.length - 1;
  const focused = data[focus];

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-muted">Care costs {focused.month === data[data.length - 1].month ? "this month" : `in ${focused.month}`}</p>
          <p className="text-2xl font-bold tabular-nums text-ink">{euro(totals[focus])}</p>
        </div>
        <p className="text-right text-xs text-muted">
          average {euro0(totals.reduce((a, b) => a + b, 0) / totals.length)}
          <br />
          per month
        </p>
      </div>

      <div className="relative mt-4 flex h-36 items-end gap-2.5" role="img" aria-label="Care costs per month, last six months">
        {data.map((d, i) => (
          <button
            key={d.month}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={() => setHover(i)}
            className="group flex h-full flex-1 flex-col items-center justify-end"
            aria-label={`${d.month}: ${euro(totals[i])}`}
          >
            <span className={cx("flex w-full max-w-7 flex-col-reverse gap-[2px] transition-opacity", hover !== null && hover !== i && "opacity-45")} style={{ height: `${(totals[i] / max) * 100}%` }}>
              {series.map((s, si) => {
                const v = d[s.key];
                if (!v) return null;
                const isTop = series.slice(si + 1).every((t) => !d[t.key]);
                return (
                  <span
                    key={s.key}
                    className={cx("w-full", isTop && "rounded-t-[4px]")}
                    style={{ height: `${(v / totals[i]) * 100}%`, background: s.color, minHeight: 2 }}
                  />
                );
              })}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2.5 border-t border-line pt-1.5">
        {data.map((d, i) => (
          <span key={d.month} className={cx("flex-1 text-center text-[11px]", i === focus ? "font-bold text-ink" : "text-muted")}>
            {d.month}
          </span>
        ))}
      </div>

      <ul className="mt-3 space-y-1.5">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
            <span className="flex-1 text-ink">{s.label}</span>
            <span className="tabular-nums text-muted">{euro(focused[s.key])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
