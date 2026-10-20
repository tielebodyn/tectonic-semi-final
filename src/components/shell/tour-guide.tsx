"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Compass, X } from "lucide-react";
import { actions, useDemo } from "@/lib/store";
import { TOURS, goToStep, startTour, tourById } from "@/lib/tour";
import { Avatar, Button, cx } from "@/components/ui";

function useTour() {
  const s = useDemo();
  const router = useRouter();
  const pathname = usePathname();
  if (!s.tour) return null;

  const tour = tourById(s.tour.path);
  const index = s.tour.step;
  const finished = !!s.tour.finished;
  const step = tour.steps[index];
  const total = tour.steps.length;
  const nextTour = TOURS.find((t) => t.id === tour.id + 1) ?? null;

  return {
    tour,
    index,
    total,
    step,
    finished,
    nextTour,
    isFirst: index === 0,
    isLast: index === total - 1,
    next: () => {
      if (finished) return;
      if (index + 1 < total) goToStep(tour.id, index + 1, router, pathname);
      else actions.setTour({ path: tour.id, step: index, finished: true });
    },
    prev: () => {
      if (finished) actions.setTour({ path: tour.id, step: index });
      else if (index > 0) goToStep(tour.id, index - 1, router, pathname);
    },
    startNext: () => (nextTour ? startTour(nextTour.id, router) : undefined),
    stop: () => {
      actions.setTour(null);
      router.push("/");
    },
  };
}

type TourApi = NonNullable<ReturnType<typeof useTour>>;

function Progress({ index, total }: { index: number; total: number }) {
  return (
    <span className="block h-1 overflow-hidden rounded-full bg-line" aria-hidden>
      <span className="block h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
    </span>
  );
}

/**
 * Side effects of the current scene: scroll the focused element into view and
 * highlight it, and let the presenter use the arrow keys.
 */
export function TourDirector() {
  const t = useTour();
  const pathname = usePathname();
  const focus = t?.step.focus;
  const key = t ? `${t.tour.id}-${t.index}-${pathname}` : "";

  useEffect(() => {
    if (!key) return;
    let tries = 0;
    let el: Element | null = null;
    const timer = setInterval(() => {
      tries++;
      el = focus ? document.querySelector(`[data-tour="${focus}"]`) : null;
      if (el && (el as HTMLElement).offsetParent !== null) {
        el.classList.add("tour-focus");
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        clearInterval(timer);
      } else if (!focus || tries > 20) {
        if (!focus) document.getElementById("phone-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
        clearInterval(timer);
      }
    }, 80);
    return () => {
      clearInterval(timer);
      el?.classList.remove("tour-focus");
    };
  }, [key, focus]);

  const next = t?.next;
  const prev = t?.prev;
  useEffect(() => {
    if (!next || !prev) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") next();
      if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return null;
}

function Controls({ t, size = "sm" }: { t: TourApi; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-2">
      <Button size={size} variant="secondary" onClick={t.prev} disabled={t.isFirst} aria-label="Previous step">
        <ArrowLeft className="size-4" aria-hidden />
        {size === "md" && "Previous"}
      </Button>
      <Button size={size} className="flex-1" onClick={t.next}>
        {t.isLast ? "Finish" : "Next"} <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

function Finished({ t, size = "sm" }: { t: TourApi; size?: "sm" | "md" }) {
  return (
    <div className="space-y-2.5">
      <p className="flex items-center gap-2 text-sm font-bold text-calm">
        <Check className="size-4" aria-hidden /> Path {t.tour.id} complete: {t.tour.title}
      </p>
      {t.nextTour && (
        <Button size={size} full onClick={t.startNext}>
          Path {t.nextTour.id}: {t.nextTour.title} <ArrowRight className="size-4" aria-hidden />
        </Button>
      )}
      <div className="flex gap-2">
        <Button size={size} variant="secondary" onClick={t.prev} aria-label="Back to the last step">
          <ArrowLeft className="size-4" aria-hidden />
        </Button>
        <Button size={size} variant="secondary" className="flex-1" onClick={t.stop}>
          All paths
        </Button>
      </div>
    </div>
  );
}

/** Guide strip at the bottom of the phone, for mobile screens. */
export function TourBar() {
  const t = useTour();
  const [collapsed, setCollapsed] = useState(false);
  if (!t) return null;

  return (
    <div
      data-tour-guide
      className="shrink-0 border-t border-line bg-white px-4 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 shadow-[0_-10px_30px_-18px_rgba(10,43,87,0.4)] lg:hidden"
    >
      {t.finished ? (
        <Finished t={t} />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <Compass className="size-3.5" aria-hidden />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-bold text-ink">
              <span className="font-semibold text-muted">
                {t.index + 1}/{t.total} ·{" "}
              </span>
              {t.step.title}
            </p>
            <button type="button" onClick={() => setCollapsed((c) => !c)} className="rounded-full p-1 text-muted hover:bg-canvas" aria-label={collapsed ? "Expand" : "Collapse"}>
              {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            <button type="button" onClick={t.stop} className="-mr-1 rounded-full p-1 text-muted hover:bg-canvas" aria-label="Stop path">
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-2">
            <Progress index={t.index} total={t.total} />
          </div>
          {!collapsed && (
            <div key={t.index} className="animate-fade-in">
              <p className="mt-2 text-[13px] leading-snug text-ink">{t.step.caption}</p>
              <p className="mt-1 text-xs leading-snug text-muted">
                <span className="font-semibold text-brand">Why it matters:</span> {t.step.why}
              </p>
            </div>
          )}
          <div className="mt-2.5">
            <Controls t={t} />
          </div>
        </>
      )}
    </div>
  );
}

/** Larger guide next to the phone frame on desktop, for presenting on a big screen. */
export function TourPanel() {
  const t = useTour();
  if (!t) return <div className="hidden w-[340px] shrink-0 lg:block" aria-hidden />;

  return (
    <aside data-tour-guide className="hidden w-[340px] shrink-0 rounded-[28px] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,43,87,0.45)] ring-1 ring-line lg:block">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand">Path {t.tour.id} of 3</p>
        <button type="button" onClick={t.stop} className="rounded-full p-1 text-muted hover:bg-canvas" aria-label="Stop path">
          <X className="size-4" />
        </button>
      </div>
      <h2 className="mt-1 text-xl font-bold text-ink">{t.tour.title}</h2>
      <div className="mt-2 flex -space-x-2">
        {t.tour.people.map((p) => (
          <Avatar key={p} id={p} size="sm" ring />
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted">
          <span>
            Step {t.index + 1} of {t.total}
          </span>
          <span>← → keys work too</span>
        </div>
        <Progress index={t.index} total={t.total} />
      </div>

      {t.finished ? (
        <div className="mt-6">
          <Finished t={t} size="md" />
        </div>
      ) : (
        <>
          <div key={`${t.tour.id}-${t.index}`} className={cx("mt-5 min-h-[200px] animate-fade-in")}>
            <h3 className="text-lg font-bold leading-snug text-ink">{t.step.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">{t.step.caption}</p>
            <p className="mt-4 rounded-2xl bg-brand-mist px-3.5 py-3 text-sm leading-snug text-ink ring-1 ring-brand/15">
              <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-brand">Why it matters</span>
              {t.step.why}
            </p>
          </div>
          <div className="mt-6">
            <Controls t={t} size="md" />
          </div>
        </>
      )}
    </aside>
  );
}
