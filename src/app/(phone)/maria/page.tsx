"use client";

import Link from "next/link";
import { ChevronRight, HeartHandshake, Phone, ScrollText, ShieldCheck, Users } from "lucide-react";
import { PEOPLE, firstName } from "@/lib/data";
import { euro } from "@/lib/format";
import { actions, FRAUD_RULE, FRAUD_TX } from "@/lib/store";
import { useDemo } from "@/lib/store";
import { Avatar, Button, ButtonLink, toast } from "@/components/ui";

export default function MariaHome() {
  const s = useDemo();
  const pending = s.approvals.find((a) => a.elder === "maria" && a.status === "pending");
  const fraudOpen = s.fraud === "alert" || s.fraud === "calling" || s.fraud === "blocking";
  const fraudNotified = (s.rules.maria.find((r) => r.condition === FRAUD_RULE)?.notify ?? ["sarah", "ann"]).map(firstName).join(" and ");

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Hello Maria</h1>

      <div className="mt-5">
        {fraudOpen && s.fraudAnswer === "none" ? (
          <FocusCard tone="attention">
            <p className="text-lg font-semibold text-attention">A question from KBC</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">Was this you?</h2>
            <p className="mt-3 text-ink">
              A transfer of <strong>{euro(FRAUD_TX.amount)}</strong> to &ldquo;{FRAUD_TX.name}&rdquo;. We have put it on hold.
            </p>
            <div className="mt-5 space-y-3">
              <Button full size="xl" onClick={() => actions.answerFraud()}>
                No, that wasn’t me
              </Button>
              <Button full size="xl" variant="secondary" onClick={() => toast("Thank you. Please call us so we can confirm it together.")}>
                Yes, that was me
              </Button>
            </div>
          </FocusCard>
        ) : fraudOpen ? (
          <FocusCard tone="calm">
            <ShieldCheck className="size-10 text-calm" aria-hidden />
            <h2 className="mt-2 text-2xl font-bold text-ink">Thank you for telling us</h2>
            <p className="mt-2 text-ink">Your money is still in your account. We have let {fraudNotified} know, as you asked.</p>
          </FocusCard>
        ) : s.fraud === "resolved" ? (
          <FocusCard tone="calm">
            <ShieldCheck className="size-10 text-calm" aria-hidden />
            <h2 className="mt-2 text-2xl font-bold text-ink">The transfer has been stopped</h2>
            <p className="mt-2 text-ink">Sarah blocked the suspicious transfer together with KBC. We will give you a call tomorrow.</p>
          </FocusCard>
        ) : pending ? (
          <FocusCard>
            <div className="flex items-center gap-3">
              <Avatar id={pending.requestedBy} size="lg" />
              <p className="text-lg font-semibold text-muted">{firstName(pending.requestedBy)} has a question</p>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-ink">Can this payment go ahead?</h2>
            <ButtonLink href="/maria/goedkeuren" full size="xl" className="mt-5">
              Take a look
            </ButtonLink>
          </FocusCard>
        ) : s.mantel.maria !== "active" ? (
          <FocusCard>
            <HeartHandshake className="size-10 text-brand" aria-hidden />
            <h2 className="mt-2 text-2xl font-bold text-ink">
              {s.pendingInvite ? `${firstName(s.pendingInvite.by)} has invited you` : "Would you like someone to help you?"}
            </h2>
            <p className="mt-2 text-ink">
              {s.pendingInvite
                ? `${firstName(s.pendingInvite.by)} would like to help you. You decide what she may see or do.`
                : "For example, to pay a bill if you can’t. You choose what they may do."}
            </p>
            <ButtonLink href="/onboarding/ouder" full size="xl" className="mt-5">
              {s.pendingInvite ? "View the invitation" : "Choose someone"}
            </ButtonLink>
          </FocusCard>
        ) : (
          <FocusCard tone="calm">
            <ShieldCheck className="size-10 text-calm" aria-hidden />
            <h2 className="mt-2 text-2xl font-bold text-ink">Everything is in order</h2>
            <p className="mt-2 text-ink">Nothing is waiting for you.</p>
          </FocusCard>
        )}
      </div>

      {s.mantel.maria === "active" && (
        <nav className="mt-8 space-y-3">
          <BigLink href="/maria/toestemming" icon={Users} title="Who helps me?" sub={helpers(s)} />
          <BigLink href="/maria/toestemming#logboek" icon={ScrollText} title="What did they do?" sub="Everything your helpers did" />
        </nav>
      )}

      <button
        type="button"
        onClick={() => toast("Connecting you to KBC Live.")}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-xl font-semibold text-navy ring-2 ring-inset ring-line"
      >
        <Phone className="size-6" aria-hidden /> Call KBC
      </button>
    </div>
  );
}

function helpers(s: ReturnType<typeof useDemo>) {
  const names = s.circles.maria.filter((m) => m.status !== "revoked").map((m) => PEOPLE[m.personId].firstName);
  return names.length ? names.join(", ") : "No one yet";
}

function FocusCard({ children, tone }: { children: React.ReactNode; tone?: "attention" | "calm" }) {
  return (
    <div
      className={
        tone === "attention"
          ? "rounded-3xl bg-attention-soft p-6 ring-2 ring-attention/30"
          : tone === "calm"
            ? "rounded-3xl bg-calm-soft p-6"
            : "rounded-3xl bg-brand-mist p-6 ring-2 ring-brand/20"
      }
    >
      {children}
    </div>
  );
}

function BigLink({ href, icon: Icon, title, sub }: { href: string; icon: typeof Users; title: string; sub: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-3xl bg-canvas p-5 transition-colors hover:bg-brand-mist">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-navy">
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-bold text-ink">{title}</span>
        <span className="block text-lg text-muted">{sub}</span>
      </span>
      <ChevronRight className="size-7 text-navy" aria-hidden />
    </Link>
  );
}
