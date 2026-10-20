"use client";

import { useEffect, useRef, type ReactNode, type SyntheticEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BatteryFull, BellRing, Signal, Wifi } from "lucide-react";
import { actions, useDemo, useHydrated } from "@/lib/store";
import { Toaster, cx, toast } from "@/components/ui";
import { TourBar, TourDirector, TourPanel } from "./tour-guide";

export function PhoneShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const touring = useDemo().tour !== null && hydrated;
  const lastNudge = useRef(0);

  // During a guided path the demo plays itself: taps inside the phone are swallowed
  // (scrolling still works) and the jury moves on with Next and Previous.
  const guard = (e: SyntheticEvent) => {
    if (!touring) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-tour-guide]")) return;
    if (!target.closest("button, a, input, textarea, select, label, [role=switch]")) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "click" && Date.now() - lastNudge.current > 3000) {
      lastNudge.current = Date.now();
      toast("Use Next to continue the demo.");
    }
  };

  // The phone has its own scroll container: start every screen at the top.
  useEffect(() => {
    document.getElementById("phone-scroll")?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-canvas lg:flex lg:items-center lg:justify-center lg:gap-12 lg:bg-[radial-gradient(ellipse_at_top_left,#e3f3fc,transparent_55%),radial-gradient(ellipse_at_bottom_right,#e8eef8,transparent_50%)] lg:p-6">
      {hydrated ? <TourPanel /> : <div className="hidden w-[340px] shrink-0 lg:block" aria-hidden />}
      <div
        onClickCapture={guard}
        onMouseDownCapture={guard}
        data-tour-lock={touring ? "" : undefined}
        className="relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-canvas lg:mx-0 lg:h-[min(880px,calc(100dvh-48px))] lg:w-[400px] lg:shrink-0 lg:rounded-[52px] lg:shadow-[0_40px_80px_-20px_rgba(10,43,87,0.35)] lg:ring-[11px] lg:ring-[#0c1a2c]"
      >
        <StatusBar />
        <div id="phone-scroll" className="relative flex-1 overflow-y-auto overscroll-contain no-scrollbar">
          {hydrated ? children : null}
        </div>
        {hydrated && <TourBar />}
        {hydrated && <TourDirector />}
        <div id="overlay-root" className="pointer-events-none absolute inset-0 z-40" />
        {hydrated && <PushBanner />}
        <Toaster />
      </div>
      {/* Mirrors the guide panel so the phone stays centred on desktop. */}
      <div className="hidden w-[340px] shrink-0 lg:block" aria-hidden />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="relative hidden h-11 shrink-0 items-center justify-between bg-white px-8 pt-1 text-[13px] font-semibold text-ink lg:flex">
      <span>9:41</span>
      <span className="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-[#0c1a2c]" aria-hidden />
      <span className="flex items-center gap-1.5" aria-hidden>
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryFull className="size-4" />
      </span>
    </div>
  );
}

function PushBanner() {
  const { push, viewer } = useDemo();
  const router = useRouter();

  useEffect(() => {
    if (!push) return;
    const t = setTimeout(() => actions.clearPush(), 9000);
    return () => clearTimeout(t);
  }, [push]);

  if (!push || (push.for && push.for !== viewer)) return null;
  return (
    <button
      key={push.id}
      type="button"
      onClick={() => {
        actions.clearPush();
        if (push.href) router.push(push.href);
      }}
      className="absolute inset-x-3 top-3 z-50 flex animate-slide-down items-start gap-3 rounded-3xl bg-white/95 p-3.5 text-left shadow-[0_18px_40px_-12px_rgba(10,43,87,0.45)] ring-1 ring-line backdrop-blur lg:top-12"
    >
      <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-2xl text-white", push.tone === "alert" ? "bg-attention" : "bg-navy")}>
        <BellRing className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted">
          KBC Mantel <span className="font-medium normal-case tracking-normal">now</span>
        </span>
        <span className="mt-0.5 block text-sm font-bold text-ink">{push.title}</span>
        <span className="block text-sm text-muted">{push.body}</span>
      </span>
    </button>
  );
}
