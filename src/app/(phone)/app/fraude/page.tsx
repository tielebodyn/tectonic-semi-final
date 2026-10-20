"use client";

import { useEffect, useState } from "react";
import { BellRing, Check, CircleCheck, Home, Phone, PhoneOff, ShieldCheck, ShieldOff } from "lucide-react";
import { DEMO_TODAY, PEOPLE, firstName } from "@/lib/data";
import { euro, when } from "@/lib/format";
import { actions, FRAUD_RULE, FRAUD_TX } from "@/lib/store";
import { useCurrent } from "@/lib/use-current";
import { Avatar, Badge, Button, ButtonLink, Card, SectionTitle, Sheet, Spinner, SuccessMark, WhyThis, cx, toast, wait } from "@/components/ui";

export default function FraudPage() {
  const { s, role, elder, link } = useCurrent();

  if (!link || elder !== "maria" || s.fraud === "none") {
    return (
      <Card className="mt-2 py-10 text-center">
        <ShieldCheck className="mx-auto size-9 text-calm" aria-hidden />
        <p className="mt-2 font-semibold">No alerts</p>
        <p className="text-sm text-muted">Nothing unusual on the account.</p>
      </Card>
    );
  }
  if (s.fraud === "resolved") return <Resolved />;
  if (role === "meldingen") return <AlertOnlyView />;
  return <FullView />;
}

function RuleCard() {
  const { s } = useCurrent();
  const rule = s.rules.maria.find((r) => r.condition === FRAUD_RULE);
  const notified = rule?.notify ?? [];
  const others = s.circles.maria.filter((m) => m.status === "active" && !notified.includes(m.personId));
  return (
    <Card className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Maria&rsquo;s rule</p>
      <p className="text-base font-semibold text-ink">&ldquo;{FRAUD_RULE}, let {notified.map(firstName).join(" and ")} know.&rdquo;</p>
      <div className="space-y-2">
        {notified.map((p) => (
          <div key={p} className="flex items-center gap-2 text-sm">
            <Avatar id={p} size="sm" />
            <span className="flex-1 font-semibold">{PEOPLE[p].firstName}</span>
            <Badge tone="calm">
              <Check className="size-3" aria-hidden /> alerted
            </Badge>
          </div>
        ))}
        {others.map((m) => (
          <div key={m.personId} className="flex items-center gap-2 text-sm text-muted">
            <Avatar id={m.personId} size="sm" />
            <span className="flex-1">{PEOPLE[m.personId].firstName}</span>
            <span className="text-xs">not in this rule</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FullView() {
  const { s, canAct, viewer } = useCurrent();
  const [calling, setCalling] = useState(false);
  const blocking = s.fraud === "blocking";

  const block = async () => {
    setCalling(false);
    actions.setFraud("blocking");
    await wait(2800);
    actions.setFraud("resolved");
  };

  return (
    <div>
      <div className="flex items-center gap-2 px-1 text-sm font-bold text-attention">
        <BellRing className="size-4" aria-hidden /> Alert based on Maria&rsquo;s rule
      </div>
      <h1 className="mt-1 px-1 text-2xl font-bold leading-tight tracking-tight">We put an unusual transfer on hold</h1>
      <p className="mt-2 px-1 text-sm text-muted">The money is still in Maria&rsquo;s account. Check with her that it wasn&rsquo;t her, then block it with KBC.</p>

      <Card className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge tone="attention">on hold</Badge>
          <span className="text-xs text-muted">{s.fraudAt ? when(s.fraudAt) : "just now"}</span>
        </div>
        <p className="text-3xl font-bold tabular-nums text-ink">{euro(FRAUD_TX.amount)}</p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted">To: </span>
            <span className="font-semibold">{FRAUD_TX.name}</span>
          </p>
          <p>
            <span className="text-muted">Account: </span>
            {FRAUD_TX.iban}
          </p>
          <p>
            <span className="text-muted">Made in: </span>
            {FRAUD_TX.channel}
          </p>
        </div>
        <WhyThis label="Why does KBC find this unusual?" defaultOpen>
          <ul className="list-disc space-y-1 pl-4">
            <li>Maria has never paid this account before.</li>
            <li>The amount is much higher than usual. On average, she pays {euro(FRAUD_TX.avg)}.</li>
            <li>The transfer came from a device Maria has never used before.</li>
          </ul>
        </WhyThis>
      </Card>

      <Card className="mt-3 flex items-start gap-3">
        <Avatar id="maria" />
        <div className="text-sm">
          <p className="font-semibold text-ink">We also asked Maria: &ldquo;Was this you?&rdquo;</p>
          <p className="text-muted">{s.fraudAnswer === "not-me" ? "Maria answered: “No, that wasn’t me.”" : "She hasn’t answered yet."}</p>
        </div>
      </Card>

      <div className="mt-4 space-y-2">
        <Button full size="lg" onClick={() => setCalling(true)} disabled={blocking}>
          <Phone className="size-4" aria-hidden /> Call Mum
        </Button>
        {canAct ? (
          <Button full size="lg" variant="secondary" onClick={block} loading={blocking}>
            {blocking ? "KBC is blocking the transfer…" : <><ShieldOff className="size-4" aria-hidden /> Block it with KBC</>}
          </Button>
        ) : (
          <p className="rounded-2xl bg-canvas p-3 text-center text-xs text-muted">Only Sarah (Pay role) can block it with KBC.</p>
        )}
      </div>

      {blocking && (
        <Card className="mt-3 space-y-2 text-sm">
          <BlockStep delay={0} text="Connected to KBC Secure4u, the fraud team" />
          <BlockStep delay={900} text="Transfer cancelled" />
          <BlockStep delay={1800} text="Unknown device removed from Maria's KBC Mobile" />
        </Card>
      )}

      <SectionTitle>Who was alerted?</SectionTitle>
      <RuleCard />

      <Sheet open={calling} onClose={() => setCalling(false)}>
        <CallView viewerName={firstName(viewer)} onBlock={canAct ? block : undefined} onEnd={() => setCalling(false)} />
      </Sheet>
    </div>
  );
}

function CallView({ onBlock, onEnd, viewerName }: { onBlock?: () => void; onEnd: () => void; viewerName: string }) {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      setConnected(true);
      actions.answerFraud();
    }, 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="space-y-5 pb-2 text-center">
      <Avatar id="maria" size="xl" />
      <div>
        <p className="text-xl font-bold">Mum</p>
        <p className="text-sm text-muted">{connected ? "On call · 00:42" : "Calling…"}</p>
      </div>
      {connected ? (
        <div className="rounded-2xl bg-canvas p-4 text-left text-sm">
          <p className="font-semibold text-ink">Maria:</p>
          <p className="text-ink">&ldquo;No {viewerName}, that wasn&rsquo;t me. Someone did just call, saying he was from the bank&hellip;&rdquo;</p>
        </div>
      ) : (
        <Spinner className="mx-auto size-6 text-brand" />
      )}
      {connected && onBlock && (
        <Button full size="lg" onClick={onBlock}>
          <ShieldOff className="size-4" aria-hidden /> Block it with KBC
        </Button>
      )}
      <button type="button" onClick={onEnd} className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#d64545] text-white" aria-label="Hang up">
        <PhoneOff className="size-6" />
      </button>
    </div>
  );
}

function BlockStep({ delay, text }: { delay: number; text: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), delay + 800);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <p className={cx("flex items-center gap-2", done ? "text-ink" : "text-muted")}>
      {done ? <CircleCheck className="size-4 text-calm" aria-hidden /> : <Spinner className="size-4 text-brand" />}
      {text}
    </p>
  );
}

function AlertOnlyView() {
  return (
    <div>
      <div className="flex items-center gap-2 px-1 text-sm font-bold text-attention">
        <BellRing className="size-4" aria-hidden /> Alert based on Maria&rsquo;s rule
      </div>
      <h1 className="mt-1 px-1 text-2xl font-bold leading-tight">Something unusual happened on Maria&rsquo;s account</h1>
      <p className="mt-2 px-1 text-sm text-muted">KBC has put a transfer on hold. Sarah has also been alerted and is dealing with it.</p>

      <Card className="mt-4 space-y-2 text-sm">
        <p className="font-semibold text-ink">What can you do?</p>
        <p className="text-ink">You can call Maria or visit her.</p>
      </Card>

      <div className="mt-4 space-y-2">
        <Button full size="lg" onClick={() => toast("Calling Maria.")}>
          <Phone className="size-4" aria-hidden /> Call Maria
        </Button>
        <Button full size="lg" variant="secondary" onClick={() => toast("We've let Sarah know you're popping round to Maria.")}>
          <Home className="size-4" aria-hidden /> I&rsquo;ll pop round
        </Button>
      </div>

      <p className="mt-4 rounded-2xl bg-canvas p-3 text-xs text-muted">
        With the Alerts role, you don’t see amounts or account details. Maria chose these settings.
      </p>
    </div>
  );
}

function Resolved() {
  const { role, s } = useCurrent();
  const base = new Date(s.fraudAt ?? `${DEMO_TODAY}T14:00:00`).getTime();
  const at = (min: number) => new Date(base + min * 60_000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="pt-2 text-center">
      <SuccessMark large />
      <h1 className="mt-5 text-2xl font-bold">The fraud attempt has been stopped</h1>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
        {role === "meldingen" ? "The money is still in Maria’s account." : `${euro(FRAUD_TX.amount)} is still in Maria’s account.`} Sarah and Ann were alerted through the rule Maria set up.
      </p>

      <Card className="mt-6 text-left">
        <ol className="space-y-3 text-sm">
          {[
            [at(0), "KBC put an unusual transfer on hold"],
            [at(0), "Sarah and Ann alerted, as set in Maria's rule"],
            [at(1), "Sarah called Maria: she didn't recognise the transfer"],
            [at(2), "Sarah blocked the transfer with KBC Secure4u"],
          ].map(([t, txt]) => (
            <li key={txt} className="flex gap-3">
              <span className="w-11 shrink-0 font-semibold tabular-nums text-muted">{t}</span>
              <span className="flex-1 text-ink">{txt}</span>
              <Check className="size-4 shrink-0 text-calm" aria-hidden />
            </li>
          ))}
        </ol>
      </Card>

      <SectionTitle>What happens next?</SectionTitle>
      <Card className="space-y-2 text-left text-sm">
        <p className="text-ink">Tomorrow, someone from KBC will call Maria to go through everything with her.</p>
        <p className="text-muted">Good to know: KBC will never ask for your codes by phone or text message.</p>
      </Card>

      <ButtonLink href="/app" variant="secondary" className="mt-5">
        Back to Home
      </ButtonLink>
    </div>
  );
}
