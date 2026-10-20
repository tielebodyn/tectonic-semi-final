const euroFmt = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" });
const euroRound = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const euro = (n: number) => euroFmt.format(n);
export const euro0 = (n: number) => euroRound.format(n);

const dayFmt = new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "short" });
const longFmt = new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("nl-BE", { hour: "2-digit", minute: "2-digit" });

export const shortDate = (iso: string) => dayFmt.format(new Date(iso));
export const longDate = (iso: string) => longFmt.format(new Date(iso));

/** "vandaag 14:32", "gisteren 09:10" or "3 okt. 18:40" */
export function when(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days === 0) return `vandaag ${timeFmt.format(d)}`;
  if (days === 1) return `gisteren ${timeFmt.format(d)}`;
  return `${dayFmt.format(d)} ${timeFmt.format(d)}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}
