const euroFmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" });
const euroRound = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const euro = (n: number) => euroFmt.format(n);
export const euro0 = (n: number) => euroRound.format(n);

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const longFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

export const shortDate = (iso: string) => dayFmt.format(new Date(iso));
export const longDate = (iso: string) => longFmt.format(new Date(iso));

/** "today 14:32", "yesterday 09:10" or "3 Oct 18:40" */
export function when(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days === 0) return `today ${timeFmt.format(d)}`;
  if (days === 1) return `yesterday ${timeFmt.format(d)}`;
  return `${dayFmt.format(d)} ${timeFmt.format(d)}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
