const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ");

const NAVY = "#063f6b";
const CYAN = "#00aeef";

/**
 * One half of the mark: a mantle that rises to a rounded top, sweeps in towards the
 * centre and ends in a rounded foot. The right half is the same shape, mirrored.
 */
const HALF =
  "M1 64L24 11C27 3 32 0 37 0C42 0 46 3 50 8C53 12 56 17 58 22C55 32 48 40 39 47C38 56 37 64 33 71C30 76 24 79 16 79C8 79 0 77 0 71C0 68 0 66 1 64Z";
const FOLD = "M9 69L39 47.5";

type Tone = "color" | "white" | "mono";

/** The Mantel mark: two mantles forming an M around a person (the dot). */
export function LogoMark({ tone = "color", className }: { tone?: Tone; className?: string }) {
  const body = tone === "white" ? "#ffffff" : tone === "mono" ? "#111111" : NAVY;
  const dot = tone === "mono" ? "#111111" : CYAN;
  const fold = tone === "white" ? NAVY : "#ffffff";
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <g>
        <path d={HALF} fill={body} />
        <path d={FOLD} stroke={fold} strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
      </g>
      <g transform="translate(120 0) scale(-1 1)">
        <path d={HALF} fill={body} />
        <path d={FOLD} stroke={fold} strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
      </g>
      <circle cx="60" cy="61.5" r="13" fill={dot} />
    </svg>
  );
}

/** App icon: the white mark on a navy rounded square. */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex shrink-0 items-center justify-center rounded-[28%] bg-[#063f6b]", className)} aria-hidden>
      <LogoMark tone="white" className="w-[68%]" />
    </span>
  );
}

/** Mark plus wordmark. `onDark` uses white for both, for navy headers. */
export function Logo({ className, onDark, size = "md" }: { className?: string; onDark?: boolean; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: { mark: "h-5", text: "text-[19px]" }, md: { mark: "h-7", text: "text-2xl" }, lg: { mark: "h-10", text: "text-[34px]" } };
  return (
    <span className={cx("inline-flex items-center gap-2", className)} aria-label="Mantel">
      <LogoMark tone={onDark ? "white" : "color"} className={cx("w-auto", sizes[size].mark)} />
      <span className={cx("font-logo font-semibold leading-none tracking-[-0.01em]", sizes[size].text, onDark ? "text-white" : "text-[#063f6b]")} aria-hidden>
        Mantel
      </span>
    </span>
  );
}
