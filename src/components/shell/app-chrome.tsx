"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Clock, Home, KeyRound, Plus, ShieldCheck, Sparkles, Store, Users, Wallet } from "lucide-react";
import { PEOPLE } from "@/lib/data";
import { actions } from "@/lib/store";
import { useCurrent } from "@/lib/use-current";
import { Avatar, Badge, RoleBadge, RoleExplainer, Sheet, cx } from "@/components/ui";

export function AppHeader() {
  const { viewer, viewerPerson, links, link, elder, elderPerson, profile, role, limit, member, s } = useCurrent();
  const [switcher, setSwitcher] = useState(false);
  const [roleInfo, setRoleInfo] = useState(false);
  const router = useRouter();

  const alertCount = s.fraud === "alert" && elder === "maria" && role ? 1 : 0;

  return (
    <header className="relative z-30 bg-navy px-4 pb-4 pt-3 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-white/10">
            <KeyRound className="size-3.5" aria-hidden />
          </span>
          <span className="text-[15px] font-bold tracking-tight">KBC Mantel</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={role === "meldingen" ? "/app" : "/app/signalen"} className="relative rounded-full p-2 hover:bg-white/10" aria-label="Meldingen">
            <Bell className="size-5" />
            {alertCount > 0 && <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-[#ffb547] ring-2 ring-navy" />}
          </Link>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 py-1 pl-1 pr-2.5 text-xs font-semibold">
            <Avatar id={viewer} size="sm" />
            {viewerPerson.firstName}
          </span>
        </div>
      </div>

      {link ? (
        <>
          <button
            type="button"
            onClick={() => setSwitcher(true)}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white/[0.08] p-2.5 text-left ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/[0.13]"
          >
            <Avatar id={elder} size="lg" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">Mantel van</span>
              <span className="block text-lg font-bold leading-tight">
                {elderPerson.firstName} {elderPerson.lastName}
              </span>
              <span className="block text-xs text-white/70">
                {elderPerson.age} jaar · {profile.region}
              </span>
            </span>
            {links.length > 1 && <Badge className="bg-white/15 text-white ring-white/20">{links.length} ouders</Badge>}
            <ChevronDown className="size-5 text-white/70" aria-hidden />
          </button>

          <button type="button" onClick={() => setRoleInfo(true)} className="mt-2.5 flex w-full items-center gap-2 text-left text-xs text-white/80">
            {role ? (
              <>
                <span>Uw rol:</span>
                <RoleBadge role={role} size="sm" />
                <span className="truncate">
                  {role === "handelen" ? `tot €${limit} per betaling` : role === "inzage" ? "bekijken, niet betalen" : "enkel meldingen"}
                </span>
                {member?.guest && <Badge className="ml-auto bg-white/10 text-white ring-white/20">gast</Badge>}
              </>
            ) : (
              <>
                <Clock className="size-3.5" aria-hidden />
                <span>Wacht op goedkeuring van {elderPerson.firstName}. Er is nog niets gedeeld.</span>
              </>
            )}
          </button>
        </>
      ) : (
        <p className="mt-3 text-sm text-white/75">U bent nog in geen enkele Mantel.</p>
      )}

      <Sheet open={switcher} onClose={() => setSwitcher(false)} title="Voor wie zorgt u?">
        <div className="space-y-2">
          {links.map((l) => (
            <button
              key={l.elder}
              type="button"
              onClick={() => {
                actions.setActiveElder(l.elder);
                setSwitcher(false);
                router.push("/app");
              }}
              className={cx(
                "flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 ring-inset transition-colors",
                l.elder === elder ? "bg-brand-mist ring-brand" : "ring-line hover:bg-canvas",
              )}
            >
              <Avatar id={l.elder} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">
                  {PEOPLE[l.elder].firstName} {PEOPLE[l.elder].lastName}
                </span>
                <span className="block text-sm text-muted">
                  {PEOPLE[l.elder].age} jaar · {PEOPLE[l.elder].city}
                </span>
              </span>
              {l.role ? <RoleBadge role={l.role} /> : <Badge tone="attention">{l.state === "waiting" ? "wacht op goedkeuring" : "uitgenodigd"}</Badge>}
            </button>
          ))}
          {viewer === "sarah" && (
            <Link
              href="/onboarding/kind"
              onClick={() => setSwitcher(false)}
              className="flex items-center gap-3 rounded-2xl p-3 text-sm font-semibold text-navy border-2 border-dashed border-line hover:bg-canvas"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft">
                <Plus className="size-5" aria-hidden />
              </span>
              Start een Mantel voor iemand anders
            </Link>
          )}
          <p className="flex gap-2 px-1 pt-2 text-xs text-muted">
            <ShieldCheck className="size-4 shrink-0 text-calm" aria-hidden />
            Uw rol is per persoon. Elke ouder kiest zelf wat u mag zien of doen.
          </p>
        </div>
      </Sheet>

      <Sheet open={roleInfo} onClose={() => setRoleInfo(false)} title="Wat mag ik doen?">
        {role ? (
          <div className="space-y-4">
            <RoleExplainer role={role} limit={limit} />
            <p className="rounded-2xl bg-canvas p-3 text-sm text-muted">
              {elderPerson.firstName} koos deze rol zelf en kan ze altijd aanpassen of stoppen. Alles wat u doet, wordt bijgehouden in het logboek en {elderPerson.firstName} krijgt
              er een melding van.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">U hebt nog geen rol. {elderPerson.firstName} beslist zelf of en hoe u kan helpen.</p>
        )}
      </Sheet>
    </header>
  );
}

type NavItem = { href: string; label: string; icon: typeof Home };

export function BottomNav() {
  const { role, link } = useCurrent();
  const pathname = usePathname();

  let items: NavItem[];
  if (!link || link.state !== "active") {
    items = [
      { href: "/app", label: "Overzicht", icon: Home },
      { href: "/app/diensten", label: "Diensten", icon: Store },
    ];
  } else if (role === "meldingen") {
    items = [
      { href: "/app", label: "Meldingen", icon: Bell },
      { href: "/app/kring", label: "Kring", icon: Users },
    ];
  } else {
    items = [
      { href: "/app", label: "Overzicht", icon: Home },
      { href: "/app/signalen", label: "Signalen", icon: Sparkles },
      { href: "/app/diensten", label: "Diensten", icon: Store },
      { href: "/app/vermogen", label: "Vermogen", icon: Wallet },
      { href: "/app/kring", label: "Kring", icon: Users },
    ];
  }

  return (
    <nav className="sticky bottom-0 z-30 border-t border-line bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-1.5 backdrop-blur">
      <ul className="flex justify-around">
        {items.map((it) => {
          const active = it.href === "/app" ? pathname === "/app" : pathname.startsWith(it.href);
          const Icon = it.icon;
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={cx("flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition-colors", active ? "text-navy" : "text-faint hover:text-muted")}
              >
                <span className={cx("flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-brand-soft")}>
                  <Icon className="size-5" aria-hidden />
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
