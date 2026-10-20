"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Fingerprint, HeartHandshake, KeyRound, Play, Radar, RotateCcw, UserRound } from "lucide-react";
import { DEMO_STEPS } from "@/lib/demo-steps";
import { PEOPLE } from "@/lib/data";
import { actions } from "@/lib/store";
import type { PersonId, RoleId } from "@/lib/types";
import { Avatar, Badge, RoleBadge, RoleExplainer, Toaster, buttonClass, toast } from "@/components/ui";

const OPEN_AI_API_KET = "c2a7b3ed-4178-4c68-b320-500147b6adb9";
const ENTRY_POINTS = [
  {
    icon: Radar,
    title: "KBC merkt een signaal op",
    detail: "KBC ziet veranderingen op Maria's rekening en vraagt het aan Maria zelf, met uitleg.",
    run: () => {
      actions.prepareStep(1);
      return "/onboarding/signaal";
    },
  },
  {
    icon: KeyRound,
    title: "De ouder start zelf",
    detail: "Maria kiest vertrouwenspersonen, rollen en als-dan-regels. In grote letters.",
    run: () => {
      actions.prepareStep(2);
      return "/onboarding/ouder";
    },
  },
  {
    icon: HeartHandshake,
    title: "Het kind start",
    detail: "Sarah krijgt meteen waarde en nodigt Maria uit. Er wordt niets gedeeld tot Maria ja zegt.",
    run: () => {
      actions.reset();
      actions.setViewer("sarah", "maria");
      return "/onboarding/kind";
    },
  },
  {
    icon: Fingerprint,
    title: "Gast via itsme",
    detail: "Tom is geen KBC-klant. Hij sluit aan via een link en itsme.",
    run: () => {
      actions.prepareStep(3);
      return "/gast";
    },
  },
];

const SCREENS: { label: string; href: string; viewer?: PersonId }[] = [
  { label: "Dashboard", href: "/app" },
  { label: "Kring", href: "/app/kring" },
  { label: "Vermogen", href: "/app/vermogen" },
  { label: "Signalen", href: "/app/signalen" },
  { label: "Diensten", href: "/app/diensten" },
  { label: "Woonzorgcentra", href: "/app/diensten/woonzorg" },
  { label: "Betalen namens", href: "/app/betalen" },
  { label: "Logboek", href: "/app/logboek" },
  { label: "Toestemmingscentrum (Maria)", href: "/maria/toestemming", viewer: "maria" },
  { label: "Dashboard als Tom (Inzage)", href: "/app", viewer: "tom" },
  { label: "Dashboard als Ann (Meldingen)", href: "/app", viewer: "ann" },
];

const PERSONAS: { id: PersonId; text: string; roles?: { label: string; role: RoleId }[] }[] = [
  { id: "maria", text: "79, woont alleen in haar huis in Gent. KBC-klant. Houdt de sleutel." },
  { id: "jozef", text: "84, Aalst. Schoonvader van Sarah. In een zorgtraject, zoekt een woonzorgcentrum." },
  { id: "sarah", text: "48, dochter van Maria. Werkt voltijds, twee kinderen. KBC-klant.", roles: [{ label: "Maria", role: "handelen" }, { label: "Jozef", role: "inzage" }] },
  { id: "tom", text: "45, zoon van Maria. Geen KBC-klant: gast via itsme.", roles: [{ label: "Maria", role: "inzage" }] },
  { id: "ann", text: "72, buurvrouw van Maria. Krijgt enkel meldingen.", roles: [{ label: "Maria", role: "meldingen" }] },
];

export default function DemoStart() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top_left,#dff1fb,transparent_50%)]">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2.5 text-navy">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-navy text-white">
              <KeyRound className="size-5" aria-hidden />
            </span>
            <span className="text-xl font-bold">KBC Mantel</span>
            <Badge tone="brand">demo · hackathon finale</Badge>
          </span>
          <button
            type="button"
            onClick={() => {
              actions.reset();
              toast("De demo staat terug op nul.");
            }}
            className={buttonClass("secondary", "sm")}
          >
            <RotateCcw className="size-4" aria-hidden /> Demo resetten
          </button>
        </header>

        <section className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl">
              Samen zorgen. <span className="text-brand">De ouder houdt de sleutel.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              KBC Mantel brengt thuiszorg, woningaanpassingen, apotheek, verzekeringen, financiën en broers en zussen samen op één plek. KBC deelt nooit iets zonder de
              uitdrukkelijke toestemming van de oudere zelf.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => router.push(DEMO_STEPS[0].run())} className={buttonClass("primary", "lg")}>
                <Play className="size-4" aria-hidden /> Start de demo
              </button>
              <Link href="/kbc" className={buttonClass("secondary", "lg")}>
                <BarChart3 className="size-4" aria-hidden /> KBC-zicht
              </Link>
            </div>
          </div>
          <div className="rounded-[28px] bg-white p-5 shadow-[0_20px_50px_-25px_rgba(10,43,87,0.35)] ring-1 ring-line">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Drie rollen, per oudere</p>
            <div className="mt-4 space-y-4">
              {(["meldingen", "inzage", "handelen"] as RoleId[]).map((r) => (
                <RoleExplainer key={r} role={r} limit={500} compact />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink">Demoscenario, onder de 3 minuten</h2>
          </div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_STEPS.map((step) => (
              <li key={step.n}>
                <button
                  type="button"
                  onClick={() => router.push(step.run())}
                  className="group flex h-full w-full flex-col rounded-[22px] bg-white p-5 text-left ring-1 ring-line transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-18px_rgba(10,43,87,0.4)] hover:ring-brand/40"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{step.n}</span>
                  <span className="mt-4 block text-base font-bold leading-snug text-ink">{step.title}</span>
                  <span className="mt-1.5 block flex-1 text-sm text-muted">{step.detail}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-brand">
                    Open <ArrowRight className="size-4" aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-ink">Vier manieren om te starten</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ENTRY_POINTS.map((e) => {
              const Icon = e.icon;
              return (
                <button
                  key={e.title}
                  type="button"
                  onClick={() => router.push(e.run())}
                  className="flex flex-col rounded-[22px] bg-white p-5 text-left ring-1 ring-line transition-colors hover:ring-brand/40"
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-navy">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="mt-4 font-bold text-ink">{e.title}</span>
                  <span className="mt-1 text-sm text-muted">{e.detail}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-ink">Personages</h2>
            <ul className="mt-5 space-y-2.5">
              {PERSONAS.map((p) => (
                <li key={p.id} className="flex items-start gap-3 rounded-[22px] bg-white p-4 ring-1 ring-line">
                  <Avatar id={p.id} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">
                      {PEOPLE[p.id].firstName} {PEOPLE[p.id].lastName}
                    </p>
                    <p className="text-sm text-muted">{p.text}</p>
                    {p.roles && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                        {p.roles.map((r) => (
                          <span key={r.label} className="flex items-center gap-1">
                            voor {r.label} <RoleBadge role={r.role} size="sm" />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ink">Rechtstreeks naar een scherm</h2>
            <p className="mt-2 text-sm text-muted">Met Maria&rsquo;s Mantel al ingesteld.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SCREENS.map((sc) => (
                <button
                  key={sc.label}
                  type="button"
                  onClick={() => {
                    actions.prepareStep(4);
                    if (sc.viewer) actions.setViewer(sc.viewer, "maria");
                    router.push(sc.href);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy ring-1 ring-line hover:bg-brand-mist"
                >
                  {sc.viewer && <UserRound className="size-3.5" aria-hidden />}
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="pointer-events-none fixed inset-0">
        <Toaster />
      </div>
    </div>
  );
}
