"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";

/** Large, calm header for the elderly person's own screens. */
export function SeniorHeader({ backHref, label = "Mijn Mantel" }: { backHref?: string; label?: string }) {
  const pathname = usePathname();
  const back = backHref ?? (pathname !== "/maria" && pathname.startsWith("/maria") ? "/maria" : undefined);
  return (
    <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
      {back ? (
        <Link href={back} className="inline-flex items-center gap-2 rounded-2xl py-2 pr-3 text-xl font-semibold text-navy">
          <ArrowLeft className="size-7" aria-hidden /> Terug
        </Link>
      ) : (
        <span className="flex items-center gap-2.5 text-navy">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-navy text-white">
            <KeyRound className="size-5" aria-hidden />
          </span>
          <span className="text-xl font-bold">{label}</span>
        </span>
      )}
      <span className="rounded-full bg-canvas px-3 py-1 text-sm font-semibold text-muted">Grote letters</span>
    </header>
  );
}
