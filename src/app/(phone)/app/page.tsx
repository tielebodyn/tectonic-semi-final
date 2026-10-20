"use client";

import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Check,
  CircleCheck,
  Clock,
  CreditCard,
  EyeOff,
  HeartHandshake,
  ListChecks,
  Lock,
  MapPin,
  Phone,
  ScrollText,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { PEOPLE, RECURRING, SERVICES, SIGNALS, TASKS, fullName } from "@/lib/data";
import { euro, greeting, shortDate } from "@/lib/format";
import { actions, FRAUD_TX } from "@/lib/store";
import { useCurrent } from "@/lib/use-current";
import { ChildSpace } from "@/components/child-space";
import { SignalCard } from "@/components/signal-card";
import { Badge, ButtonLink, Card, SectionTitle, cx } from "@/components/ui";

export default function DashboardPage() {
  const cur = useCurrent();
  const { link, role, viewerPerson, elderPerson } = cur;

  if (!link) {
    return (
      <div className="py-10 text-center">
        <HeartHandshake className="mx-auto size-10 text-brand" aria-hidden />
        <h1 className="mt-3 text-xl font-bold">Nog geen Mantel</h1>
        <p className="mt-2 text-sm text-muted">Start een Mantel voor iemand die u helpt. Die persoon beslist zelf wat u mag zien.</p>
        <ButtonLink href="/onboarding/kind" className="mt-5">
          Start een Mantel
        </ButtonLink>
      </div>
    );
  }

  if (link.state === "waiting") return <WaitingDashboard />;

  if (link.state === "invited") {
    return (
      <Card className="mt-2 space-y-3 text-center">
        <Clock className="mx-auto size-8 text-brand" aria-hidden />
        <h1 className="text-lg font-bold">Bevestig eerst wie u bent</h1>
        <p className="text-sm text-muted">{elderPerson.firstName} nodigde u uit. Bevestig met itsme om aan te sluiten.</p>
        <ButtonLink href="/gast" variant="itsme">
          Verder met itsme
        </ButtonLink>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="px-1 text-2xl font-bold tracking-tight text-ink">
        {greeting()}, {viewerPerson.firstName}
      </h1>
      {role === "meldingen" ? <AlertOnlyDashboard /> : <FullDashboard />}
    </div>
  );
}

// ---------------------------------------------------------------------------

function WaitingDashboard() {
  const { elderPerson, s } = useCurrent();
  return (
    <div>
      <Card className="space-y-3 bg-brand-mist ring-brand/20">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy">
          <Clock className="size-4" aria-hidden /> Wacht op goedkeuring van {elderPerson.firstName}
        </div>
        <p className="text-sm text-ink">
          Uw uitnodiging is verstuurd{s.pendingInvite ? ` op ${shortDate(s.pendingInvite.at)}` : ""}. Tot {elderPerson.firstName} aanvaardt, wordt er niets over haar gedeeld.
        </p>
        <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 text-xs text-muted">
          <EyeOff className="size-4 shrink-0 text-navy" aria-hidden />
          Gedeeld met u: niets. {elderPerson.firstName} kiest zelf wie wat mag zien.
        </div>
        <ButtonLink href="/onboarding/kind" variant="secondary" size="sm">
          Bekijk de uitnodiging
        </ButtonLink>
      </Card>
      <ChildSpace />
    </div>
  );
}

// ---------------------------------------------------------------------------

function AlertOnlyDashboard() {
  const { s, elder, elderPerson } = useCurrent();
  const fraudOpen = s.fraud === "alert" || s.fraud === "calling" || s.fraud === "blocking";

  return (
    <div>
      <p className="mt-1 px-1 text-sm text-muted">U ontvangt enkel meldingen over {elderPerson.firstName}, volgens de regels die zij zelf koos.</p>

      <SectionTitle>Meldingen</SectionTitle>
      {fraudOpen ? (
        <Card className="space-y-3 ring-attention/30">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-attention-soft text-attention">
              <BellRing className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium text-muted">Volgens de regel van {elderPerson.firstName} · nu</p>
              <h3 className="font-bold text-ink">Er gebeurde iets ongewoons op de rekening van {elderPerson.firstName}</h3>
            </div>
          </div>
          <p className="text-sm text-ink">
            KBC heeft het tegengehouden en Sarah is ook verwittigd. Kunt u even bij {elderPerson.firstName} langsgaan of haar bellen?
          </p>
          <div className="flex gap-2">
            <ButtonLink href="/app/fraude" size="sm">
              <Phone className="size-4" aria-hidden /> Bel {elderPerson.firstName}
            </ButtonLink>
            <ButtonLink href="/app/fraude" size="sm" variant="secondary">
              Meer info
            </ButtonLink>
          </div>
        </Card>
      ) : s.fraud === "resolved" ? (
        <Card className="flex items-start gap-3 bg-calm-soft ring-calm/20">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-calm" aria-hidden />
          <div>
            <h3 className="font-bold text-ink">Opgelost</h3>
            <p className="text-sm text-ink">Sarah en KBC hebben de ongewone overschrijving samen gestopt. Bedankt om mee op te letten.</p>
          </div>
        </Card>
      ) : (
        <Card className="py-8 text-center">
          <ShieldCheck className="mx-auto size-9 text-calm" aria-hidden />
          <p className="mt-2 font-semibold text-ink">Alles is rustig</p>
          <p className="text-sm text-muted">Geen meldingen. We laten het u weten als het nodig is.</p>
        </Card>
      )}

      <SectionTitle>Wat zie ik, en wat niet?</SectionTitle>
      <Card className="space-y-2 text-sm">
        <p className="flex gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-calm" aria-hidden /> Meldingen volgens de regels van {elderPerson.firstName}
        </p>
        <p className="flex gap-2 text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden /> Geen saldo&rsquo;s, betalingen of vermogen
        </p>
        <p className="flex gap-2 text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden /> Geen bedragen in de meldingen zelf
        </p>
      </Card>

      <SectionTitle>Regels die u verwittigen</SectionTitle>
      <Card className="space-y-2">
        {s.rules[elder]
          .filter((r) => r.active && r.notify.includes(s.viewer))
          .map((r) => (
            <p key={r.id} className="text-sm">
              <span className="font-semibold">{r.condition}</span>, verwittig {r.notify.map((p) => PEOPLE[p].firstName).join(" en ")}.
            </p>
          ))}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

function FullDashboard() {
  const { s, elder, elderPerson, profile, canAct, viewer } = useCurrent();
  const name = elderPerson.firstName;
  const signals = SIGNALS.filter((x) => x.elder === elder && !s.dismissed.includes(x.id));
  const openBills = s.bills[elder].filter((b) => b.status === "open" || b.status === "awaiting-approval");
  const tasks = TASKS[elder];
  const requested = s.requested[elder];
  const pending = s.approvals.filter((a) => a.elder === elder && a.status === "pending");
  const fraudOpen = elder === "maria" && (s.fraud === "alert" || s.fraud === "calling" || s.fraud === "blocking");
  const actor = s.circles[elder].find((m) => m.role === "handelen" && m.status === "active");

  return (
    <div>
      <p className="mt-1 px-1 text-sm text-muted">
        {fraudOpen ? "Er is één melding die uw aandacht vraagt." : `Alles is rustig bij ${name}. ${signals.length ? `${signals.length} nieuwe signalen.` : ""}`}
      </p>

      {fraudOpen && (
        <Link href="/app/fraude" className="mt-4 block animate-fade-in">
          <Card className="space-y-2 bg-attention-soft ring-attention/30">
            <div className="flex items-center gap-2 text-sm font-bold text-attention">
              <BellRing className="size-4" aria-hidden /> Melding volgens {name}&rsquo;s regel
            </div>
            <p className="font-bold text-ink">Ongewone overschrijving van {euro(FRAUD_TX.amount)} tegengehouden</p>
            <p className="text-sm text-ink">Naar een onbekend rekeningnummer. Het geld staat nog op {name}&rsquo;s rekening. Bekijk samen wat er gebeurde.</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy">
              Bekijken <ArrowRight className="size-4" aria-hidden />
            </span>
          </Card>
        </Link>
      )}
      {elder === "maria" && s.fraud === "resolved" && (
        <Card className="mt-4 flex items-start gap-3 bg-calm-soft ring-calm/20">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-calm" aria-hidden />
          <div className="text-sm">
            <p className="font-bold text-ink">Fraudepoging gestopt</p>
            <p className="text-ink">{euro(FRAUD_TX.amount)} bleef op {name}&rsquo;s rekening, dankzij haar eigen regel.</p>
          </div>
        </Card>
      )}

      {pending.map((a) => {
        const bill = s.bills[elder].find((b) => b.id === a.billId)!;
        return (
          <Card key={a.id} className="mt-4 flex items-start gap-3 bg-brand-mist ring-brand/20">
            <Clock className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden />
            <div className="text-sm">
              <p className="font-bold text-ink">Wacht op goedkeuring van {name}</p>
              <p className="text-ink">
                {euro(bill.amount)} aan {bill.payee}. Dat is boven haar limiet, dus {name} beslist.
              </p>
            </div>
          </Card>
        );
      })}

      <SectionTitle>Zorgsituatie</SectionTitle>
      <Card className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="brand">{profile.careLevel}</Badge>
          <Badge>
            <MapPin className="size-3" aria-hidden /> {profile.region}
          </Badge>
        </div>
        <p className="text-sm text-ink">
          <span className="font-semibold">{profile.living}.</span> {profile.careSummary}
        </p>
        <p className="text-xs text-muted">Huisarts: {profile.gp}</p>
      </Card>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <QuickAction href="/app/betalen" icon={CreditCard} label="Betalen" locked={!canAct} />
        <QuickAction href="/app/diensten" icon={Store} label="Diensten" />
        <QuickAction href="/app/logboek" icon={ScrollText} label="Logboek" />
        <QuickAction href="/app/kring" icon={Users} label="Kring" />
      </div>

      <SectionTitle action={<span className="text-xs font-semibold text-muted">{tasks.filter((t) => s.tasksDone.includes(t.id)).length}/{tasks.length}</span>}>
        Open taken
      </SectionTitle>
      <Card className="divide-y divide-line p-1.5">
        {tasks.map((t) => {
          const done = s.tasksDone.includes(t.id);
          return (
            <button key={t.id} type="button" onClick={() => actions.toggleTask(t.id)} className="flex w-full items-start gap-3 p-2.5 text-left">
              <span className={cx("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md ring-1 ring-inset", done ? "bg-calm text-white ring-calm" : "ring-line")}>
                {done && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
              </span>
              <span>
                <span className={cx("block text-sm font-semibold", done ? "text-muted line-through" : "text-ink")}>{t.title}</span>
                <span className="block text-xs text-muted">{t.detail}</span>
              </span>
            </button>
          );
        })}
      </Card>

      {signals.length > 0 && (
        <>
          <SectionTitle action={<Link href="/app/signalen" className="text-xs font-semibold text-brand">Alle signalen</Link>}>Recente signalen</SectionTitle>
          <Card className="space-y-1 p-2">
            {signals.slice(0, 3).map((sig) => (
              <SignalCard key={sig.id} signal={sig} compact />
            ))}
          </Card>
        </>
      )}

      <SectionTitle>Komende betalingen</SectionTitle>
      <Card className="divide-y divide-line p-1.5">
        {openBills.length === 0 && <p className="p-3 text-sm text-muted">Geen openstaande facturen.</p>}
        {openBills.map((b) => (
          <div key={b.id} className="flex items-center gap-3 p-2.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{b.payee}</span>
              <span className="block text-xs text-muted">
                {b.description} · vervalt {shortDate(b.due)}
              </span>
            </span>
            <span className="text-right">
              <span className="block text-sm font-bold tabular-nums text-ink">{euro(b.amount)}</span>
              {b.status === "awaiting-approval" ? (
                <span className="text-[11px] font-semibold text-attention">wacht op {name}</span>
              ) : canAct ? (
                <Link href={`/app/betalen`} className="text-[11px] font-semibold text-brand">
                  Betalen
                </Link>
              ) : null}
            </span>
          </div>
        ))}
        {!canAct && actor && (
          <p className="flex items-center gap-2 p-2.5 text-xs text-muted">
            <Lock className="size-3.5" aria-hidden /> {actor.personId === viewer ? "" : `${PEOPLE[actor.personId].firstName} regelt de betalingen (Handelen). `}Met Inzage kan u kijken, niet betalen.
          </p>
        )}
      </Card>

      <SectionTitle>Actieve diensten</SectionTitle>
      <Card className="divide-y divide-line p-1.5">
        {RECURRING[elder].map((r) => (
          <div key={r.name} className="flex items-center gap-3 p-2.5">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{r.name}</span>
              <span className="block text-xs text-muted">{r.detail}</span>
            </span>
            <Badge tone="calm">actief</Badge>
          </div>
        ))}
        {requested.map((r) => {
          const svc = SERVICES.find((x) => x.id === r.serviceId);
          return (
            <div key={r.serviceId + r.at} className="flex items-center gap-3 p-2.5">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{svc?.partner}</span>
                <span className="block text-xs text-muted">
                  {svc?.name}
                  {r.withLoan ? " · met KBC Renovatielening" : ""}
                </span>
              </span>
              <Badge tone="brand">aangevraagd</Badge>
            </div>
          );
        })}
      </Card>

      <p className="mt-6 flex items-start gap-2 px-1 text-xs text-muted">
        <ListChecks className="mt-0.5 size-4 shrink-0" aria-hidden />
        {name} houdt de sleutel. Alles wat u doet staat in het logboek, en {fullName(elder)} krijgt er een melding van.
      </p>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, locked }: { href: string; icon: typeof Store; label: string; locked?: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 text-xs font-semibold text-navy ring-1 ring-line/70 transition-colors hover:bg-brand-mist">
      <span className="relative flex size-9 items-center justify-center rounded-full bg-brand-soft">
        <Icon className="size-4.5" aria-hidden />
        {locked && (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-white ring-1 ring-line">
            <Lock className="size-2.5 text-muted" aria-hidden />
          </span>
        )}
      </span>
      {label}
    </Link>
  );
}
