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
import { PEOPLE, RECURRING, SERVICES, SIGNALS, TASKS, poss, subj } from "@/lib/data";
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
        <h1 className="mt-3 text-xl font-bold">No Mantel yet</h1>
        <p className="mt-2 text-sm text-muted">Start a Mantel for someone you help. They choose what you can see.</p>
        <ButtonLink href="/onboarding/kind" className="mt-5">
          Start a Mantel
        </ButtonLink>
      </div>
    );
  }

  if (link.state === "waiting") return <WaitingDashboard />;

  if (link.state === "invited") {
    return (
      <Card className="mt-2 space-y-3 text-center">
        <Clock className="mx-auto size-8 text-brand" aria-hidden />
        <h1 className="text-lg font-bold">First, confirm who you are</h1>
        <p className="text-sm text-muted">{elderPerson.firstName} invited you. Confirm your identity with itsme to join.</p>
        <ButtonLink href="/gast" variant="itsme">
          Continue with itsme
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
  const { elder, elderPerson, s } = useCurrent();
  return (
    <div>
      <Card className="space-y-3 bg-brand-mist ring-brand/20">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy">
          <Clock className="size-4" aria-hidden /> Waiting for {elderPerson.firstName} to accept
        </div>
        <p className="text-sm text-ink">
          Your invitation was sent{s.pendingInvite ? ` on ${shortDate(s.pendingInvite.at)}` : ""}. Until {elderPerson.firstName} accepts, nothing about {poss(elder)} finances is shared with you.
        </p>
        <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 text-xs text-muted">
          <EyeOff className="size-4 shrink-0 text-navy" aria-hidden />
          Shared with you: nothing yet. {elderPerson.firstName} decides who sees what.
        </div>
        <ButtonLink href="/onboarding/kind" variant="secondary" size="sm">
          View the invitation
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
      <p className="mt-1 px-1 text-sm text-muted">You only get alerts about {elderPerson.firstName}, based on the rules {subj(elder)} chose.</p>

      <SectionTitle>Alerts</SectionTitle>
      {fraudOpen ? (
        <Card className="space-y-3 ring-attention/30">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-attention-soft text-attention">
              <BellRing className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium text-muted">{elderPerson.firstName}&rsquo;s rule · just now</p>
              <h3 className="font-bold text-ink">Something unusual happened on {elderPerson.firstName}&rsquo;s account</h3>
            </div>
          </div>
          <p className="text-sm text-ink">
            KBC put it on hold and Sarah has been alerted too. Could you pop round to {elderPerson.firstName} or give {elder === "maria" ? "her" : "him"} a call?
          </p>
          <div className="flex gap-2">
            <ButtonLink href="/app/fraude" size="sm">
              <Phone className="size-4" aria-hidden /> Call {elderPerson.firstName}
            </ButtonLink>
            <ButtonLink href="/app/fraude" size="sm" variant="secondary">
              Learn more
            </ButtonLink>
          </div>
        </Card>
      ) : s.fraud === "resolved" ? (
        <Card className="flex items-start gap-3 bg-calm-soft ring-calm/20">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-calm" aria-hidden />
          <div>
            <h3 className="font-bold text-ink">Transfer stopped</h3>
            <p className="text-sm text-ink">Sarah and KBC stopped the unusual transfer. The money is still in {elderPerson.firstName}&rsquo;s account.</p>
          </div>
        </Card>
      ) : (
        <Card className="py-8 text-center">
          <ShieldCheck className="mx-auto size-9 text-calm" aria-hidden />
          <p className="mt-2 font-semibold text-ink">No alerts</p>
          <p className="text-sm text-muted">We&rsquo;ll let you know if something needs your attention.</p>
        </Card>
      )}

      <SectionTitle>What can I see?</SectionTitle>
      <Card className="space-y-2 text-sm">
        <p className="flex gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-calm" aria-hidden /> Alerts based on {elderPerson.firstName}&rsquo;s rules
        </p>
        <p className="flex gap-2 text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden /> No balances, payments or assets
        </p>
        <p className="flex gap-2 text-muted">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden /> No amounts in the alerts themselves
        </p>
      </Card>

      <SectionTitle>Rules that alert you</SectionTitle>
      <Card className="space-y-2">
        {s.rules[elder]
          .filter((r) => r.active && r.notify.includes(s.viewer))
          .map((r) => (
            <p key={r.id} className="text-sm">
              <span className="font-semibold">{r.condition}</span>, let {r.notify.map((p) => PEOPLE[p].firstName).join(" and ")} know.
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
        {fraudOpen
          ? "There's 1 alert that needs your attention."
          : `Nothing needs your attention.${signals.length ? ` ${signals.length} new ${signals.length === 1 ? "insight" : "insights"}.` : ""}`}
      </p>

      {fraudOpen && (
        <Link href="/app/fraude" data-tour="fraud-card" className="mt-4 block animate-fade-in rounded-[var(--radius-card)]">
          <Card className="space-y-2 bg-attention-soft ring-attention/30">
            <div className="flex items-center gap-2 text-sm font-bold text-attention">
              <BellRing className="size-4" aria-hidden /> Alert from {name}&rsquo;s rule
            </div>
            <p className="font-bold text-ink">KBC put a transfer of {euro(FRAUD_TX.amount)} on hold</p>
            <p className="text-sm text-ink">It was going to an unknown account abroad. The money is still in {name}&rsquo;s account. Check with {name} whether she made it.</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy">
              See what to do <ArrowRight className="size-4" aria-hidden />
            </span>
          </Card>
        </Link>
      )}
      {elder === "maria" && s.fraud === "resolved" && (
        <Card className="mt-4 flex items-start gap-3 bg-calm-soft ring-calm/20">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-calm" aria-hidden />
          <div className="text-sm">
            <p className="font-bold text-ink">Transfer stopped</p>
            <p className="text-ink">The {euro(FRAUD_TX.amount)} is still in {name}&rsquo;s account. The transfer was flagged by the alert rule she set up.</p>
          </div>
        </Card>
      )}

      {pending.map((a) => {
        const bill = s.bills[elder].find((b) => b.id === a.billId)!;
        return (
          <Card key={a.id} className="mt-4 flex items-start gap-3 bg-brand-mist ring-brand/20">
            <Clock className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden />
            <div className="text-sm">
              <p className="font-bold text-ink">Waiting for {name}&rsquo;s approval</p>
              <p className="text-ink">
                {euro(bill.amount)} to {bill.payee}. That&rsquo;s above the limit, so {name} decides.
              </p>
            </div>
          </Card>
        );
      })}

      <SectionTitle>Care situation</SectionTitle>
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
        <p className="text-xs text-muted">GP: {profile.gp}</p>
      </Card>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <QuickAction href="/app/betalen" icon={CreditCard} label="Pay" locked={!canAct} />
        <QuickAction href="/app/diensten" icon={Store} label="Services" />
        <QuickAction href="/app/logboek" icon={ScrollText} label="Activity" />
        <QuickAction href="/app/kring" icon={Users} label="Circle" />
      </div>

      <SectionTitle action={<span className="text-xs font-semibold text-muted">{tasks.filter((t) => s.tasksDone.includes(t.id)).length}/{tasks.length}</span>}>
        To do
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
          <SectionTitle action={<Link href="/app/signalen" className="text-xs font-semibold text-brand">See all</Link>}>What Kate noticed</SectionTitle>
          <Card className="space-y-1 p-2">
            {signals.slice(0, 3).map((sig) => (
              <SignalCard key={sig.id} signal={sig} compact />
            ))}
          </Card>
        </>
      )}

      <SectionTitle>Upcoming bills</SectionTitle>
      <Card className="divide-y divide-line p-1.5">
        {openBills.length === 0 && <p className="p-3 text-sm text-muted">No bills to pay.</p>}
        {openBills.map((b) => (
          <div key={b.id} className="flex items-center gap-3 p-2.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{b.payee}</span>
              <span className="block text-xs text-muted">
                {b.description} · due {shortDate(b.due)}
              </span>
            </span>
            <span className="text-right">
              <span className="block text-sm font-bold tabular-nums text-ink">{euro(b.amount)}</span>
              {b.status === "awaiting-approval" ? (
                <span className="text-[11px] font-semibold text-attention">waiting for {name}</span>
              ) : canAct ? (
                <Link href={`/app/betalen`} className="text-[11px] font-semibold text-brand">
                  Pay
                </Link>
              ) : null}
            </span>
          </div>
        ))}
        {!canAct && actor && (
          <p className="flex items-center gap-2 p-2.5 text-xs text-muted">
            <Lock className="size-3.5" aria-hidden /> {actor.personId === viewer ? "" : `${PEOPLE[actor.personId].firstName} pays the bills (Pay role). `}With View, you can see the bills but not pay them.
          </p>
        )}
      </Card>

      <SectionTitle>Active services</SectionTitle>
      <Card className="divide-y divide-line p-1.5">
        {RECURRING[elder].map((r) => (
          <div key={r.name} className="flex items-center gap-3 p-2.5">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{r.name}</span>
              <span className="block text-xs text-muted">{r.detail}</span>
            </span>
            <Badge tone="calm">active</Badge>
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
                  {r.withLoan ? " · with a KBC Renovation Loan" : ""}
                </span>
              </span>
              <Badge tone="brand">requested</Badge>
            </div>
          );
        })}
      </Card>

      <p className="mt-6 flex items-start gap-2 px-1 text-xs text-muted">
        <ListChecks className="mt-0.5 size-4 shrink-0" aria-hidden />
        Everything you do is recorded in the activity log, and {name} is notified.
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
