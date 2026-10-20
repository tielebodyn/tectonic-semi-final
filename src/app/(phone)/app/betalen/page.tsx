"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, BellRing, Check, ChevronRight, Clock, Fingerprint, Info, ShieldCheck } from "lucide-react";
import { ASSETS, PEOPLE, fullName } from "@/lib/data";
import { euro, shortDate } from "@/lib/format";
import { actions } from "@/lib/store";
import { useCurrent } from "@/lib/use-current";
import type { Bill } from "@/lib/types";
import { AuditLog } from "@/components/audit-log";
import { Avatar, Badge, Button, ButtonLink, Card, LockedNotice, SectionTitle, Spinner, SuccessMark, cx, wait } from "@/components/ui";

type Phase = "list" | "review" | "signing" | "done" | "sending" | "approval-sent";

export default function PayPage() {
  const router = useRouter();
  // Start fresh on every push navigation (Activity keeps the old flow otherwise).
  return (
    <Fragment key={router.bfcacheId}>
      <PayFlow />
    </Fragment>
  );
}

function PayFlow() {
  const { s, elder, elderPerson, canAct, viewer, limit, link } = useCurrent();
  const [phase, setPhase] = useState<Phase>("list");
  const [billId, setBillId] = useState<string | null>(null);
  const name = elderPerson.firstName;

  if (!link || !canAct) {
    const actor = s.circles[elder].find((m) => m.role === "handelen" && m.status === "active");
    return (
      <LockedNotice
        title="Betalen kan niet met uw rol"
        body={`Alleen wie de rol Handelen heeft, kan betalen namens ${name}. ${name} koos dit zelf.${actor ? ` Voor ${name} is dat ${PEOPLE[actor.personId].firstName}.` : ""}`}
      >
        <ButtonLink href="/app" variant="secondary" size="sm">
          Terug naar overzicht
        </ButtonLink>
      </LockedNotice>
    );
  }

  const bills = s.bills[elder];
  const bill = bills.find((b) => b.id === billId) ?? null;
  const current = ASSETS[elder].groups[0].items[0];

  if (phase === "list" || !bill) {
    const open = bills.filter((b) => b.status === "open");
    const other = bills.filter((b) => b.status !== "open");
    return (
      <div>
        <h1 className="px-1 text-2xl font-bold tracking-tight">Betalen namens {name}</h1>
        <Card className="mt-4 flex items-start gap-3 bg-brand-mist p-3.5 ring-brand/15">
          <Info className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden />
          <p className="text-sm text-ink">
            {name} gaf u <strong>Handelen</strong> tot <strong>€{limit} per betaling</strong>. Daarboven vraagt u eerst haar goedkeuring. {name} krijgt van elke betaling een
            melding.
          </p>
        </Card>

        <SectionTitle>Te betalen</SectionTitle>
        <div className="space-y-2">
          {open.length === 0 && <Card className="text-sm text-muted">Alles is betaald. Mooi zo.</Card>}
          {open.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBillId(b.id);
                setPhase("review");
              }}
              className="block w-full text-left"
            >
              <Card className="flex items-center gap-3 transition-colors hover:bg-brand-mist/60">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{b.payee}</p>
                  <p className="text-xs text-muted">
                    {b.description} · vervalt {shortDate(b.due)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums text-ink">{euro(b.amount)}</p>
                  {b.amount > limit && <p className="text-[11px] font-semibold text-attention">boven limiet</p>}
                </div>
                <ChevronRight className="size-4 text-faint" aria-hidden />
              </Card>
            </button>
          ))}
        </div>

        {other.length > 0 && (
          <>
            <SectionTitle>Afgehandeld</SectionTitle>
            <Card className="divide-y divide-line p-1.5">
              {other.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{b.payee}</span>
                    <span className="block text-xs text-muted">{b.description}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-bold tabular-nums">{euro(b.amount)}</span>
                    <BillStatus bill={b} name={name} />
                  </span>
                </div>
              ))}
            </Card>
          </>
        )}

        <Link href="/app/logboek" className="mt-5 flex items-center justify-center gap-1 text-sm font-semibold text-navy">
          Bekijk het logboek <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  const above = bill.amount > limit;

  if (phase === "done" || phase === "approval-sent") {
    return (
      <div className="pt-4 text-center">
        {phase === "done" ? <SuccessMark large /> : (
          <span className="mx-auto flex size-24 animate-pop items-center justify-center rounded-full bg-brand-soft text-navy">
            <Clock className="size-11" aria-hidden />
          </span>
        )}
        <h1 className="mt-5 text-2xl font-bold">{phase === "done" ? "Betaald namens " + name : `${name} kreeg uw vraag`}</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
          {phase === "done"
            ? `${euro(bill.amount)} aan ${bill.payee}. ${name} kreeg hiervan meteen een melding.`
            : `${euro(bill.amount)} is meer dan de limiet van €${limit}. ${name} beslist zelf, in haar eigen app.`}
        </p>

        <div className="mt-6 text-left">
          <SectionTitle action={<Link href="/app/logboek" className="text-xs font-semibold text-brand">Volledig logboek</Link>}>Logboek</SectionTitle>
          <Card className="p-2">
            <AuditLog entries={s.audit[elder]} limit={3} />
          </Card>
        </div>

        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => {
            setBillId(null);
            setPhase("list");
          }}
        >
          Nog een factuur betalen
        </Button>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => setPhase("list")} className="inline-flex items-center gap-1 px-1 text-sm font-semibold text-navy">
        <ArrowLeft className="size-4" aria-hidden /> Facturen
      </button>

      <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-card)] bg-navy p-4 text-white">
        <Avatar id={elder} size="lg" ring />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">U betaalt namens</p>
          <p className="text-lg font-bold">{fullName(elder)}</p>
        </div>
      </div>

      <Card className="mt-3 space-y-3">
        <div>
          <p className="text-xs font-medium text-muted">Van de rekening van {name}</p>
          <p className="font-semibold text-ink">{current.name}</p>
          <p className="text-xs text-muted">{current.detail}</p>
        </div>
        <ArrowDown className="size-4 text-faint" aria-hidden />
        <div>
          <p className="text-xs font-medium text-muted">Naar</p>
          <p className="font-semibold text-ink">{bill.payee}</p>
          <p className="text-xs text-muted">{bill.iban}</p>
          <p className="mt-1 text-xs text-muted">Mededeling: {bill.reference}</p>
        </div>
        <div className="border-t border-line pt-3">
          <p className="text-xs font-medium text-muted">{bill.description}</p>
          <p className="text-3xl font-bold tabular-nums text-ink">{euro(bill.amount)}</p>
        </div>
      </Card>

      <Card className={cx("mt-3 space-y-2", above ? "bg-attention-soft ring-attention/25" : "bg-calm-soft ring-calm/20")}>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-ink">
            {above ? <Clock className="size-4 text-attention" aria-hidden /> : <Check className="size-4 text-calm" aria-hidden />}
            {above ? "Boven de limiet" : "Binnen de limiet"}
          </span>
          <span className="tabular-nums text-muted">
            {euro(bill.amount)} / €{limit}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white">
          <div className={cx("h-full rounded-full", above ? "bg-attention" : "bg-calm")} style={{ width: `${Math.min(100, (bill.amount / limit) * 100)}%` }} />
        </div>
        <p className="text-xs text-ink">
          {above ? `${name} stelde een limiet van €${limit} per betaling in. Voor dit bedrag vraagt u eerst haar goedkeuring.` : `${name} stelde een limiet van €${limit} per betaling in.`}
        </p>
      </Card>

      <p className="mt-3 flex items-start gap-2 px-1 text-xs text-muted">
        <BellRing className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {name} krijgt een melding en de betaling komt in het logboek, met uw naam erbij.
      </p>

      {phase === "signing" ? (
        <Card className="mt-4 flex flex-col items-center gap-2 py-6 text-center">
          <span className="relative flex size-16 items-center justify-center rounded-full bg-brand-soft text-navy">
            <Fingerprint className="size-8" aria-hidden />
            <Spinner className="absolute -right-1 -top-1 size-5 text-brand" />
          </span>
          <p className="font-semibold">Bevestig met uw KBC-app</p>
          <p className="text-xs text-muted">We vragen uw eigen handtekening, als {fullName(viewer)}.</p>
        </Card>
      ) : above ? (
        <Button
          full
          size="lg"
          className="mt-4"
          loading={phase === "sending"}
          onClick={async () => {
            setPhase("sending");
            await wait(1100);
            actions.requestApproval(elder, bill.id, viewer);
            setPhase("approval-sent");
          }}
        >
          Vraag goedkeuring aan {name}
        </Button>
      ) : (
        <Button
          full
          size="lg"
          className="mt-4"
          onClick={async () => {
            setPhase("signing");
            await wait(1600);
            actions.payBill(elder, bill.id, viewer);
            setPhase("done");
          }}
        >
          <ShieldCheck className="size-4" aria-hidden /> Betaal namens {name}
        </Button>
      )}
    </div>
  );
}

function BillStatus({ bill, name }: { bill: Bill; name: string }) {
  if (bill.status === "paid") return <Badge tone="calm">betaald</Badge>;
  if (bill.status === "awaiting-approval") return <Badge tone="attention">wacht op {name}</Badge>;
  return <Badge>niet goedgekeurd</Badge>;
}
