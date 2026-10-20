"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown, ChevronUp, Compass, X } from "lucide-react";
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
  const finished = index >= tour.steps.length;
  const step = finished ? null : tour.steps[index];
  const done = step?.done?.(s, pathname) ?? false;
  /** Whether this step asks the jury to do something (vs. just look) */
  const task = !!step?.done;
  const nextTour = TOURS.find((t) => t.id === tour.id + 1) ?? null;

  return {
    tour,
    index,
    step,
    done,
    task,
    finished,
    nextTour,
    next: () => {
      if (index + 1 < tour.steps.length) goToStep(tour.id, index + 1, router, pathname);
      else actions.setTour({ path: tour.id, step: tour.steps.length });
    },
    startNext: () => (nextTour ? startTour(nextTour.id, router) : undefined),
    stop: () => {
      actions.setTour(null);
      router.push("/");
    },
  };
}

function Dots({ count, index }: { count: number; index: number }) {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cx("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-navy" : i < index ? "w-1.5 bg-calm" : "w-1.5 bg-line")} />
      ))}
    </span>
  );
}

/**
 * When the jury follows a tip and already lands on the screen of the next step,
 * move the guide along by itself (after a short "Done" moment).
 */
export function TourAutoAdvance() {
  const s = useDemo();
  const pathname = usePathname();
  const tour = s.tour ? tourById(s.tour.path) : null;
  const index = s.tour?.step ?? 0;
  const step = tour?.steps[index];
  const next = tour?.steps[index + 1];
  const ready = !!step && !!next && next.href === pathname && (step.done?.(s, pathname) ?? false);

  useEffect(() => {
    if (!ready || !tour) return;
    const t = setTimeout(() => {
      next!.setup?.();
      actions.setTour({ path: tour.id, step: index + 1 });
    }, 900);
    return () => clearTimeout(t);
  }, [ready, tour, index, next]);

  return null;
}

/** Guide strip at the bottom of the phone, for mobile screens. */
export function TourBar() {
  const t = useTour();
  const [collapsed, setCollapsed] = useState(false);
  if (!t) return null;

  if (t.finished) {
    return (
      <div className="shrink-0 border-t border-line bg-white px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 lg:hidden">
        <p className="flex items-center gap-2 text-sm font-bold text-calm">
          <Check className="size-4" aria-hidden /> Path {t.tour.id} done: {t.tour.title}
        </p>
        <div className="mt-2.5 flex gap-2">
          {t.nextTour && (
            <Button size="sm" className="flex-1" onClick={t.startNext}>
              Path {t.nextTour.id}: {t.nextTour.title}
            </Button>
          )}
          <Button size="sm" variant="secondary" className={t.nextTour ? "" : "flex-1"} onClick={t.stop}>
            All paths
          </Button>
        </div>
      </div>
    );
  }

  const last = t.index === t.tour.steps.length - 1;
  return (
    <div className="shrink-0 border-t border-line bg-white px-4 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 shadow-[0_-10px_30px_-18px_rgba(10,43,87,0.4)] lg:hidden">
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Compass className="size-3.5" aria-hidden />
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-bold text-ink">
          <span className="font-semibold text-muted">
            {t.index + 1}/{t.tour.steps.length} ·{" "}
          </span>
          {t.step!.title}
        </p>
        <button type="button" onClick={() => setCollapsed((c) => !c)} className="rounded-full p-1 text-muted hover:bg-canvas" aria-label={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <button type="button" onClick={t.stop} className="-mr-1 rounded-full p-1 text-muted hover:bg-canvas" aria-label="Stop path">
          <X className="size-4" />
        </button>
      </div>
      {!collapsed &&
        (t.done && !last ? (
          <p className="mt-1.5 text-[13px] leading-snug text-ink">
            <span className="font-semibold text-calm">Well done.</span> Next step: “{t.tour.steps[t.index + 1].title}”.
          </p>
        ) : (
          <>
            <p className="mt-1.5 text-[13px] leading-snug text-ink">{t.step!.hint}</p>
            <p className="mt-1 text-xs leading-snug text-muted">
              <span className="font-semibold text-brand">Why it matters:</span> {t.step!.why}
            </p>
          </>
        ))}
      <div className="mt-2 flex items-center justify-between gap-3">
        <Dots count={t.tour.steps.length} index={t.index} />
        <div className="flex items-center gap-2">
          {t.done && (
            <span className="flex items-center gap-1 text-xs font-bold text-calm">
              <Check className="size-3.5" aria-hidden /> Done
            </span>
          )}
          <Button size="sm" variant={t.done ? "calm" : t.task ? "soft" : "primary"} onClick={t.next} className={t.done ? "animate-pop" : ""}>
            {last ? "Finish" : t.done || !t.task ? "Next" : "Skip"} <ArrowRight className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Larger guide next to the phone frame on desktop, for presenting on a big screen. */
export function TourPanel() {
  const t = useTour();
  if (!t) return <div className="hidden w-[320px] shrink-0 lg:block" aria-hidden />;

  return (
    <aside className="hidden w-[320px] shrink-0 rounded-[28px] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,43,87,0.45)] ring-1 ring-line lg:block">
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

      <ol className="mt-5 space-y-1">
        {t.tour.steps.map((s, i) => {
          const current = i === t.index;
          const past = i < t.index;
          return (
            <li key={s.title} className={cx("rounded-2xl px-3 py-2.5", current && "bg-brand-mist ring-1 ring-brand/30")}>
              <p className={cx("flex items-center gap-2.5 text-sm font-semibold", past ? "text-muted" : "text-ink")}>
                <span
                  className={cx(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    past ? "bg-calm text-white" : current ? "bg-navy text-white" : "bg-canvas text-muted",
                  )}
                >
                  {past ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                {s.title}
              </p>
              {current && (
                <div className="mt-2 space-y-2 pl-[34px]">
                  <p className="text-sm leading-snug text-ink">{s.hint}</p>
                  <p className="rounded-xl bg-white/80 px-2.5 py-2 text-xs leading-snug text-muted ring-1 ring-brand/15">
                    <span className="block font-semibold uppercase tracking-[0.08em] text-brand">Why it matters</span>
                    {s.why}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {t.finished ? (
        <div className="mt-5 space-y-2">
          <p className="flex items-center gap-2 text-sm font-bold text-calm">
            <Check className="size-4" aria-hidden /> Path complete
          </p>
          {t.nextTour && (
            <Button full onClick={t.startNext}>
              Path {t.nextTour.id}: {t.nextTour.title}
            </Button>
          )}
          <Button full variant="secondary" onClick={t.stop}>
            All paths
          </Button>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-3">
          {t.done ? (
            <span className="flex items-center gap-1 text-sm font-bold text-calm">
              <Check className="size-4" aria-hidden /> Done
            </span>
          ) : (
            <span className="text-xs text-muted">{t.task ? "Follow the tip in the app" : "Have a look around"}</span>
          )}
          <Button variant={t.done ? "calm" : t.task ? "soft" : "primary"} onClick={t.next}>
            {t.index === t.tour.steps.length - 1 ? "Finish" : t.done || !t.task ? "Next" : "Skip"} <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      )}
    </aside>
  );
}
