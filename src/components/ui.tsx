"use client";

import Link from "next/link";
import { useLayoutEffect, useState, useSyncExternalStore, type ComponentProps, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Bell, Check, ChevronDown, Eye, HandCoins, Info, Loader2, Lock, X } from "lucide-react";
import { PEOPLE, ROLES } from "@/lib/data";
import type { PersonId, RoleId } from "@/lib/types";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Buttons

type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "calm" | "itsme";
type ButtonSize = "sm" | "md" | "lg" | "xl";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-navy text-white hover:bg-navy-soft active:bg-navy shadow-sm",
  secondary: "bg-white text-navy ring-1 ring-inset ring-line hover:bg-brand-mist",
  soft: "bg-brand-soft text-navy hover:bg-[#d6effa]",
  ghost: "text-navy hover:bg-brand-mist",
  calm: "bg-calm text-white hover:bg-[#177450]",
  itsme: "bg-itsme text-white hover:bg-[#e83c0b]",
};
const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm rounded-full gap-1.5",
  md: "h-11 px-5 text-[15px] rounded-full gap-2",
  lg: "h-13 px-6 text-base rounded-2xl gap-2",
  xl: "min-h-16 px-6 py-4 text-xl rounded-2xl gap-3",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", full = false) {
  return cx(
    "inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none select-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    variantClass[variant],
    sizeClass[size],
    full && "w-full",
  );
}

export function Button({
  variant,
  size,
  full,
  loading,
  className,
  children,
  ...rest
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize; full?: boolean; loading?: boolean }) {
  return (
    <button className={cx(buttonClass(variant, size, full), className)} disabled={loading || rest.disabled} {...rest}>
      {loading && <Loader2 className="size-[1.1em] animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  full,
  className,
  ...rest
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize; full?: boolean }) {
  return <Link className={cx(buttonClass(variant, size, full), className)} {...rest} />;
}

// ---------------------------------------------------------------------------
// Surfaces

export function Card({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cx("rounded-[var(--radius-card)] bg-white p-4 shadow-[0_1px_2px_rgba(16,40,80,0.05)] ring-1 ring-line/70", className)} {...rest} />;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 mt-6 flex items-end justify-between px-1">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{children}</h2>
      {action}
    </div>
  );
}

export function Badge({ className, children, tone = "neutral" }: { className?: string; children: ReactNode; tone?: "neutral" | "brand" | "calm" | "attention" | "navy" }) {
  const tones = {
    neutral: "bg-canvas text-muted ring-line",
    brand: "bg-brand-soft text-navy ring-brand/20",
    calm: "bg-calm-soft text-calm ring-calm/20",
    attention: "bg-attention-soft text-attention ring-attention/20",
    navy: "bg-navy text-white ring-navy",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Roles

export const ROLE_ICON: Record<RoleId, typeof Bell> = { meldingen: Bell, inzage: Eye, handelen: HandCoins };
const roleTone: Record<RoleId, string> = {
  meldingen: "bg-violet-50 text-violet-800 ring-violet-200",
  inzage: "bg-sky-50 text-sky-800 ring-sky-200",
  handelen: "bg-navy text-white ring-navy",
};

export function RoleBadge({ role, size = "md" }: { role: RoleId; size?: "sm" | "md" | "lg" }) {
  const Icon = ROLE_ICON[role];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset",
        size === "sm" && "px-2 py-0.5 text-[11px]",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3.5 py-1.5 text-base",
        roleTone[role],
      )}
    >
      <Icon className={size === "lg" ? "size-4" : "size-3.5"} aria-hidden />
      {ROLES[role].label}
    </span>
  );
}

export function RoleExplainer({ role, limit, compact }: { role: RoleId; limit?: number; compact?: boolean }) {
  const r = ROLES[role];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <RoleBadge role={role} />
        {role === "handelen" && limit ? <span className="text-xs font-medium text-muted">up to €{limit} per payment</span> : null}
      </div>
      <p className="text-sm text-ink">{r.short}</p>
      {!compact && (
        <ul className="space-y-1 text-sm">
          {r.can.map((c) => (
            <li key={c} className="flex gap-2 text-ink">
              <Check className="mt-0.5 size-4 shrink-0 text-calm" aria-hidden /> {c}
            </li>
          ))}
          {r.cannot.map((c) => (
            <li key={c} className="flex gap-2 text-muted">
              <X className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden /> {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// People

export function Avatar({ id, size = "md", ring }: { id: PersonId; size?: "sm" | "md" | "lg" | "xl"; ring?: boolean }) {
  const p = PEOPLE[id];
  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-12 text-base", xl: "size-16 text-xl" };
  return (
    <span className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-bold", sizes[size], p.tone, ring && "ring-2 ring-white")} aria-hidden>
      {p.firstName[0]}
      {p.lastName[0]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Transparency

export function WhyThis({ children, label = "Why am I seeing this?", defaultOpen = false, large }: { children: ReactNode; label?: string; defaultOpen?: boolean; large?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cx("inline-flex items-center gap-1.5 font-semibold text-brand hover:text-navy", large ? "text-lg" : "text-sm")}
        aria-expanded={open}
      >
        <Info className={large ? "size-5" : "size-4"} aria-hidden />
        {label}
        <ChevronDown className={cx("size-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && <div className={cx("mt-2 animate-fade-in rounded-2xl bg-brand-mist p-3 text-ink", large ? "text-lg" : "text-sm")}>{children}</div>}
    </div>
  );
}

export function LockedNotice({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center">
      <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-soft text-navy">
        <Lock className="size-6" aria-hidden />
      </span>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{body}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle

export function Toggle({ checked, onChange, label, large }: { checked: boolean; onChange: (v: boolean) => void; label: string; large?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors",
        large ? "h-9 w-16" : "h-7 w-12",
        checked ? "bg-calm" : "bg-[#cbd5e1]",
      )}
    >
      <span
        className={cx(
          "inline-block rounded-full bg-white shadow transition-transform",
          large ? "size-7" : "size-5",
          checked ? (large ? "translate-x-8" : "translate-x-6") : "translate-x-1",
        )}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Sheet (bottom sheet rendered inside the phone frame)

/** Sheets render into the phone frame's overlay layer, or the body outside it. */
function overlayRoot() {
  return document.getElementById("overlay-root") ?? document.body;
}

export function Sheet({ open, onClose, title, children, large }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; large?: boolean }) {
  // Close transient sheets when the route gets hidden by Activity.
  useLayoutEffect(() => () => onClose(), []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;
  return createPortal(
    <div className="pointer-events-auto absolute inset-0 z-40 flex flex-col justify-end">
      <button type="button" aria-label="Close" className="absolute inset-0 animate-fade-in bg-navy/35 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative max-h-[88%] animate-slide-up overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-3 no-scrollbar">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        <div className="mb-3 flex items-start justify-between gap-3">
          {title && <h2 className={cx("font-bold text-ink", large ? "text-2xl" : "text-lg")}>{title}</h2>}
          <button type="button" onClick={onClose} className="-mr-1 rounded-full p-1.5 text-muted hover:bg-canvas" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    overlayRoot(),
  );
}

// ---------------------------------------------------------------------------
// Toasts

type Toast = { id: number; text: string; action?: { label: string; onClick: () => void } };
let toasts: Toast[] = [];
let toastId = 0;
const toastListeners = new Set<() => void>();
const emitToasts = () => toastListeners.forEach((l) => l());

export function toast(text: string, action?: Toast["action"]) {
  const id = ++toastId;
  toasts = [...toasts, { id, text, action }];
  emitToasts();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emitToasts();
  }, 5000);
}

const EMPTY: Toast[] = [];
export function Toaster() {
  const list = useSyncExternalStore(
    (l) => {
      toastListeners.add(l);
      return () => toastListeners.delete(l);
    },
    () => toasts,
    () => EMPTY,
  );
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4">
      {list.map((t) => (
        <div key={t.id} className="pointer-events-auto flex w-full max-w-sm animate-fade-in items-center gap-3 rounded-2xl bg-navy px-4 py-3 text-sm text-white shadow-lg">
          <Check className="size-4 shrink-0 text-brand" aria-hidden />
          <span className="flex-1">{t.text}</span>
          {t.action && (
            <button
              type="button"
              className="font-semibold text-brand hover:text-white"
              onClick={() => {
                t.action!.onClick();
                toasts = toasts.filter((x) => x.id !== t.id);
                emitToasts();
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Misc

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cx("animate-spin", className)} aria-hidden />;
}

export function SuccessMark({ large }: { large?: boolean }) {
  return (
    <span className={cx("mx-auto flex animate-pop items-center justify-center rounded-full bg-calm-soft text-calm", large ? "size-24" : "size-16")}>
      <Check className={large ? "size-12" : "size-8"} strokeWidth={2.5} aria-hidden />
    </span>
  );
}

/** Small "simulated" wait for fake backends. */
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
