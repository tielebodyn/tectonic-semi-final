"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, BellRing, Check, ChevronRight, Clock, Fingerprint, Info, ShieldCheck } from "lucide-react";
import { ASSETS, PEOPLE, fullName, subj } from "@/lib/data";
import { euro, shortDate } from "@/lib/format";
import { actions } from "@/lib/store";
import { useCurrent } from "@/lib/use-current";
import type { Bill } from "@/lib/types";
import { AuditLog } from "@/components/audit-log";
import { Avatar, Badge, Button, ButtonLink, Card, LockedNotice, SectionTitle, Spinner, SuccessMark, cx, wait } from "@/components/ui";
import { useSceneValue } from "@/lib/tour";

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
  const [phaseLocal, setPhase] = useState<Phase>("list");
  const [billLocal, setBillId] = useState<string | null>(null);
  const phase = useSceneValue<Phase>("pay.phase") ?? phaseLocal;
  const billId = useSceneValue<string>("pay.bill") ?? billLocal;
  const name = elderPerson.firstName;

  if (!link || !canAct) {
    const actor = s.circles[elder].find((m) => m.role === "handelen" && m.status === "active");
    return (
      <LockedNotice
        title="Your role doesn't include paying"
        body={`Only someone with the Pay role can pay bills for ${name}. ${name} chooses who has this role.${actor ? ` For ${name}, that's ${PEOPLE[actor.personId].firstName}.` : ""}`}
      >
        <ButtonLink href="/app" variant="secondary" size="sm">
          Back to Home
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
        <h1 className="px-1 text-2xl font-bold tracking-tight">Pay bills for {name}</h1>
        <Card className="mt-4 flex items-start gap-3 bg-brand-mist p-3.5 ring-brand/15">
          <Info className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden />
          <p className="text-sm text-ink">
            {name} gave you the <strong>Pay</strong> role, up to <strong>€{limit} per payment</strong>. Up to €{limit}, you pay yourself. Above that, {name} approves first. {name} is
            notified of every payment.
          </p>
        </Card>

        <SectionTitle>Bills to pay</SectionTitle>
        <div className="space-y-2">
          {open.length === 0 && <Card className="text-sm text-muted">All bills are paid.</Card>}
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
                    {b.description} · due {shortDate(b.due)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums text-ink">{euro(b.amount)}</p>
                  {b.amount > limit ? (
                    <p className="text-[11px] font-semibold text-attention">Above limit · {name} approves</p>
                  ) : (
                    <p className="text-[11px] font-semibold text-calm">Within limit</p>
                  )}
                </div>
                <ChevronRight className="size-4 text-faint" aria-hidden />
              </Card>
            </button>
          ))}
        </div>

        {other.length > 0 && (
          <>
            <SectionTitle>Done</SectionTitle>
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
          View the activity log <ChevronRight className="size-4" aria-hidden />
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
        <h1 className="mt-5 text-2xl font-bold">{phase === "done" ? `Paid for ${name}` : `Request sent to ${name}`}</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
          {phase === "done"
            ? `${euro(bill.amount)} to ${bill.payee}, from ${name}'s current account. ${name} has been notified.`
            : `${euro(bill.amount)} is above the €${limit} limit, so ${name} decides. ${subj(elder) === "she" ? "She" : "He"} gets the request in KBC Mobile. Once ${subj(elder)} approves, the bill is paid.`}
        </p>

        <div className="mt-6 text-left">
          <SectionTitle action={<Link href="/app/logboek" className="text-xs font-semibold text-brand">See all</Link>}>Activity log</SectionTitle>
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
          Pay another bill
        </Button>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => setPhase("list")} className="inline-flex items-center gap-1 px-1 text-sm font-semibold text-navy">
        <ArrowLeft className="size-4" aria-hidden /> Bills
      </button>

      <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-card)] bg-navy p-4 text-white">
        <Avatar id={elder} size="lg" ring />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">You&rsquo;re paying for</p>
          <p className="text-lg font-bold">{fullName(elder)}</p>
        </div>
      </div>

      <Card className="mt-3 space-y-3">
        <div>
          <p className="text-xs font-medium text-muted">From {name}&rsquo;s account</p>
          <p className="font-semibold text-ink">{current.name}</p>
          <p className="text-xs text-muted">{current.detail}</p>
        </div>
        <ArrowDown className="size-4 text-faint" aria-hidden />
        <div>
          <p className="text-xs font-medium text-muted">To</p>
          <p className="font-semibold text-ink">{bill.payee}</p>
          <p className="text-xs text-muted">{bill.iban}</p>
          <p className="mt-1 text-xs text-muted">Reference: {bill.reference}</p>
        </div>
        <div className="border-t border-line pt-3">
          <p className="text-xs font-medium text-muted">{bill.description}</p>
          <p className="text-3xl font-bold tabular-nums text-ink">{euro(bill.amount)}</p>
        </div>
      </Card>

      <Card data-tour="limit" className={cx("mt-3 space-y-2", above ? "bg-attention-soft ring-attention/25" : "bg-calm-soft ring-calm/20")}>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-ink">
            {above ? <Clock className="size-4 text-attention" aria-hidden /> : <Check className="size-4 text-calm" aria-hidden />}
            {above ? `Above the €${limit} limit` : `Within the €${limit} limit`}
          </span>
          <span className="tabular-nums text-muted">
            {euro(bill.amount)} / €{limit}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white">
          <div className={cx("h-full rounded-full", above ? "bg-attention" : "bg-calm")} style={{ width: `${Math.min(100, (bill.amount / limit) * 100)}%` }} />
        </div>
        <p className="text-xs text-ink">
          {above
            ? `This is ${euro(bill.amount - limit)} more than the limit ${name} set. You can't pay it yourself: ${name} approves it first.`
            : `${name} set a limit of €${limit} per payment. You can pay this bill yourself.`}
        </p>
      </Card>

      <p className="mt-3 flex items-start gap-2 px-1 text-xs text-muted">
        <BellRing className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {name} is notified, and the payment appears in the activity log under your name.
      </p>

      {phase === "signing" ? (
        <Card className="mt-4 flex flex-col items-center gap-2 py-6 text-center">
          <span className="relative flex size-16 items-center justify-center rounded-full bg-brand-soft text-navy">
            <Fingerprint className="size-8" aria-hidden />
            <Spinner className="absolute -right-1 -top-1 size-5 text-brand" />
          </span>
          <p className="font-semibold">Confirm in KBC Mobile</p>
          <p className="text-xs text-muted">Sign with your own fingerprint or PIN, as {fullName(viewer)}.</p>
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
          Ask {name} for approval
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
          <ShieldCheck className="size-4" aria-hidden /> Pay for {name}
        </Button>
      )}
    </div>
  );
}

function BillStatus({ bill, name }: { bill: Bill; name: string }) {
  if (bill.status === "paid") return <Badge tone="calm">paid</Badge>;
  if (bill.status === "awaiting-approval") return <Badge tone="attention">waiting for {name}</Badge>;
  return <Badge>declined</Badge>;
}
