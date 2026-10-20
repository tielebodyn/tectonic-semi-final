"use client";

import { useEffect, useState } from "react";
import { BellRing, Check, CircleCheck, Home, Phone, PhoneOff, ShieldCheck, ShieldOff } from "lucide-react";
import { DEMO_TODAY, PEOPLE, firstName } from "@/lib/data";
import { euro, when } from "@/lib/format";
import { actions, FRAUD_TX } from "@/lib/store";
import { useCurrent } from "@/lib/use-current";
import { Avatar, Badge, Button, ButtonLink, Card, SectionTitle, Sheet, Spinner, SuccessMark, WhyThis, cx, toast, wait } from "@/components/ui";

export default function FraudPage() {
  const { s, role, elder, link } = useCurrent();

  if (!link || elder !== "maria" || s.fraud === "none") {
    return (
      <Card className="mt-2 py-10 text-center">
        <ShieldCheck className="mx-auto size-9 text-calm" aria-hidden />
        <p className="mt-2 font-semibold">Geen meldingen</p>
        <p className="text-sm text-muted">Alles is rustig op de rekening.</p>
      </Card>
    );
  }
  if (s.fraud === "resolved") return <Resolved />;
  if (role === "meldingen") return <AlertOnlyView />;
  return <FullView />;
}

function RuleCard() {
  const { s } = useCurrent();
  const rule = s.rules.maria.find((r) => r.condition.includes("verdachts"));
  const notified = rule?.notify ?? [];
  const others = s.circles.maria.filter((m) => m.status === "active" && !notified.includes(m.personId));
  return (
    <Card className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">De regel van Maria</p>
      <p className="text-base font-semibold text-ink">&ldquo;Als er iets verdachts gebeurt op mijn rekening, verwittig {notified.map(firstName).join(" en ")}.&rdquo;</p>
      <div className="space-y-2">
        {notified.map((p) => (
          <div key={p} className="flex items-center gap-2 text-sm">
            <Avatar id={p} size="sm" />
            <span className="flex-1 font-semibold">{PEOPLE[p].firstName}</span>
            <Badge tone="calm">
              <Check className="size-3" aria-hidden /> verwittigd
            </Badge>
          </div>
        ))}
        {others.map((m) => (
          <div key={m.personId} className="flex items-center gap-2 text-sm text-muted">
            <Avatar id={m.personId} size="sm" />
            <span className="flex-1">{PEOPLE[m.personId].firstName}</span>
            <span className="text-xs">niet in deze regel</span>
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
        <BellRing className="size-4" aria-hidden /> Melding volgens Maria&rsquo;s regel
      </div>
      <h1 className="mt-1 px-1 text-2xl font-bold leading-tight tracking-tight">Een ongewone overschrijving werd tegengehouden</h1>
      <p className="mt-2 px-1 text-sm text-muted">Het geld staat nog op Maria&rsquo;s rekening. Er is tijd om rustig samen te kijken.</p>

      <Card className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge tone="attention">tijdelijk tegengehouden</Badge>
          <span className="text-xs text-muted">{s.fraudAt ? when(s.fraudAt) : "zonet"}</span>
        </div>
        <p className="text-3xl font-bold tabular-nums text-ink">{euro(FRAUD_TX.amount)}</p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted">Naar: </span>
            <span className="font-semibold">{FRAUD_TX.name}</span>
          </p>
          <p>
            <span className="text-muted">Rekening: </span>
            {FRAUD_TX.iban}
          </p>
          <p>
            <span className="text-muted">Via: </span>
            {FRAUD_TX.channel}
          </p>
        </div>
        <WhyThis label="Waarom vond KBC dit ongewoon?" defaultOpen>
          <ul className="list-disc space-y-1 pl-4">
            <li>Maria betaalde nog nooit naar dit rekeningnummer.</li>
            <li>Het bedrag is veel hoger dan normaal: gemiddeld betaalt ze {euro(FRAUD_TX.avg)}.</li>
            <li>De opdracht kwam van een toestel dat Maria nooit eerder gebruikte.</li>
          </ul>
        </WhyThis>
      </Card>

      <Card className="mt-3 flex items-start gap-3">
        <Avatar id="maria" />
        <div className="text-sm">
          <p className="font-semibold text-ink">Maria kreeg ook de vraag &ldquo;Was u dit?&rdquo;</p>
          <p className="text-muted">{s.fraudAnswer === "not-me" ? "Maria antwoordde: “Nee, dat was ik niet.”" : "Ze heeft nog niet geantwoord."}</p>
        </div>
      </Card>

      <div className="mt-4 space-y-2">
        <Button full size="lg" onClick={() => setCalling(true)} disabled={blocking}>
          <Phone className="size-4" aria-hidden /> Bel mama
        </Button>
        {canAct ? (
          <Button full size="lg" variant="secondary" onClick={block} loading={blocking}>
            {blocking ? "KBC blokkeert de overschrijving…" : <><ShieldOff className="size-4" aria-hidden /> Blokkeer samen met KBC</>}
          </Button>
        ) : (
          <p className="rounded-2xl bg-canvas p-3 text-center text-xs text-muted">Sarah heeft Handelen en kan samen met KBC blokkeren.</p>
        )}
      </div>

      {blocking && (
        <Card className="mt-3 space-y-2 text-sm">
          <BlockStep delay={0} text="Verbonden met het KBC Fraudeteam" />
          <BlockStep delay={900} text="Overschrijving definitief gestopt" />
          <BlockStep delay={1800} text="Onbekend toestel losgekoppeld van Maria's KBC Mobile" />
        </Card>
      )}

      <SectionTitle>Wie werd verwittigd?</SectionTitle>
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
        <p className="text-xl font-bold">Mama</p>
        <p className="text-sm text-muted">{connected ? "In gesprek · 00:42" : "Bellen…"}</p>
      </div>
      {connected ? (
        <div className="rounded-2xl bg-canvas p-4 text-left text-sm">
          <p className="font-semibold text-ink">Maria:</p>
          <p className="text-ink">&ldquo;Nee {viewerName}, dat heb ik niet gedaan. Er belde net wel iemand die zei dat hij van de bank was&hellip;&rdquo;</p>
        </div>
      ) : (
        <Spinner className="mx-auto size-6 text-brand" />
      )}
      {connected && onBlock && (
        <Button full size="lg" onClick={onBlock}>
          <ShieldOff className="size-4" aria-hidden /> Blokkeer samen met KBC
        </Button>
      )}
      <button type="button" onClick={onEnd} className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#d64545] text-white" aria-label="Ophangen">
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
        <BellRing className="size-4" aria-hidden /> Melding volgens Maria&rsquo;s regel
      </div>
      <h1 className="mt-1 px-1 text-2xl font-bold leading-tight">Er gebeurde iets ongewoons op de rekening van Maria</h1>
      <p className="mt-2 px-1 text-sm text-muted">KBC heeft het tegengehouden. Sarah is ook verwittigd en kijkt mee.</p>

      <Card className="mt-4 space-y-2 text-sm">
        <p className="font-semibold text-ink">Wat kan u doen?</p>
        <p className="text-ink">Een vertrouwd gezicht helpt. Bel Maria even, of ga bij haar langs.</p>
      </Card>

      <div className="mt-4 space-y-2">
        <Button full size="lg" onClick={() => toast("U belt Maria.")}>
          <Phone className="size-4" aria-hidden /> Bel Maria
        </Button>
        <Button full size="lg" variant="secondary" onClick={() => toast("Sarah weet dat u even bij Maria langsgaat.")}>
          <Home className="size-4" aria-hidden /> Ik ga even langs
        </Button>
      </div>

      <p className="mt-4 rounded-2xl bg-canvas p-3 text-xs text-muted">
        Met de rol Meldingen ziet u geen bedragen of rekeninggegevens. Zo koos Maria het.
      </p>
    </div>
  );
}

function Resolved() {
  const { role, s } = useCurrent();
  const base = new Date(s.fraudAt ?? `${DEMO_TODAY}T14:00:00`).getTime();
  const at = (min: number) => new Date(base + min * 60_000).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="pt-2 text-center">
      <SuccessMark large />
      <h1 className="mt-5 text-2xl font-bold">De fraudepoging is gestopt</h1>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
        {role === "meldingen" ? "Het geld van Maria is veilig." : `${euro(FRAUD_TX.amount)} bleef op Maria's rekening.`} Dankzij haar eigen regel waren de juiste mensen op tijd
        verwittigd.
      </p>

      <Card className="mt-6 text-left">
        <ol className="space-y-3 text-sm">
          {[
            [at(0), "KBC hield een ongewone overschrijving tegen"],
            [at(0), "Sarah en Ann verwittigd, volgens de regel van Maria"],
            [at(1), "Sarah belde Maria: zij herkende de overschrijving niet"],
            [at(2), "Sarah blokkeerde de overschrijving samen met KBC"],
          ].map(([t, txt]) => (
            <li key={txt} className="flex gap-3">
              <span className="w-11 shrink-0 font-semibold tabular-nums text-muted">{t}</span>
              <span className="flex-1 text-ink">{txt}</span>
              <Check className="size-4 shrink-0 text-calm" aria-hidden />
            </li>
          ))}
        </ol>
      </Card>

      <SectionTitle>Wat nu?</SectionTitle>
      <Card className="space-y-2 text-left text-sm">
        <p className="text-ink">Morgen belt een medewerker van KBC Maria om alles rustig te overlopen.</p>
        <p className="text-muted">Goed om te weten: KBC vraagt nooit om codes via de telefoon of sms.</p>
      </Card>

      <ButtonLink href="/app" variant="secondary" className="mt-5">
        Terug naar overzicht
      </ButtonLink>
    </div>
  );
}
