"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Circle, Clock, EyeOff, HeartHandshake, KeyRound, Send, ShieldCheck } from "lucide-react";
import { shortDate } from "@/lib/format";
import { actions, useDemo } from "@/lib/store";
import { ChildSpace } from "@/components/child-space";
import { Button, Card, cx, wait } from "@/components/ui";

type Step = "intro" | "who" | "value" | "invite" | "waiting";

export default function ChildOnboardingPage() {
  const router = useRouter();
  return (
    <Fragment key={router.bfcacheId}>
      <ChildOnboarding />
    </Fragment>
  );
}

function ChildOnboarding() {
  const s = useDemo();
  const router = useRouter();
  const alreadyInvited = s.pendingInvite?.elder === "maria";
  const alreadyActive = s.mantel.maria === "active";
  const [step, setStep] = useState<Step>(alreadyInvited ? "waiting" : "intro");
  const [sending, setSending] = useState(false);

  const back: Partial<Record<Step, Step>> = { who: "intro", value: "who", invite: "value" };

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 bg-navy px-4 pb-4 pt-3 text-white">
        {back[step] ? (
          <button type="button" onClick={() => setStep(back[step]!)} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Terug">
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <button type="button" onClick={() => router.push("/app")} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Naar overzicht">
            <ArrowLeft className="size-5" />
          </button>
        )}
        <span className="flex items-center gap-2 text-[15px] font-bold">
          <KeyRound className="size-4" aria-hidden /> Nieuwe Mantel
        </span>
        <span className="ml-auto text-xs text-white/70">{["intro", "who", "value", "invite", "waiting"].indexOf(step) + 1}/5</span>
      </header>

      <main className="flex flex-1 flex-col px-4 pb-8 pt-5">
        {alreadyActive && step === "intro" ? (
          <Card className="space-y-3 text-center">
            <ShieldCheck className="mx-auto size-8 text-calm" aria-hidden />
            <p className="font-semibold">Maria heeft al een Mantel</p>
            <p className="text-sm text-muted">Zij koos zelf wie haar helpt. U bent er al bij.</p>
            <Button onClick={() => router.push("/app")}>Naar overzicht</Button>
          </Card>
        ) : (
          <>
            {step === "intro" && (
              <>
                <HeartHandshake className="size-12 text-brand" aria-hidden />
                <h1 className="mt-4 text-2xl font-bold leading-tight">Start een Mantel voor iemand die u helpt</h1>
                <p className="mt-3 text-ink">U krijgt meteen hulp: een checklist, zorg in de buurt en uw eigen mantelzorgbudget.</p>
                <Card className="mt-5 flex items-start gap-3 bg-brand-mist ring-brand/20">
                  <KeyRound className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden />
                  <p className="text-sm text-ink">
                    <strong>De ouder houdt de sleutel.</strong> Over uw moeder wordt niets gedeeld, tot zij zelf ja zegt en kiest wat u mag.
                  </p>
                </Card>
                <div className="mt-auto pt-8">
                  <Button full size="lg" onClick={() => setStep("who")}>
                    Starten
                  </Button>
                </div>
              </>
            )}

            {step === "who" && (
              <>
                <h1 className="text-2xl font-bold">Voor wie zorgt u?</h1>
                <div className="mt-5 space-y-4">
                  <Field label="Naam" value="Maria Peeters" />
                  <Field label="Relatie" value="Mijn moeder" />
                  <Field label="Gsm-nummer" value="0475 12 34 56" />
                </div>
                <p className="mt-4 flex items-start gap-2 text-xs text-muted">
                  <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden />
                  We vertellen u niet of Maria klant is bij KBC. Zij beslist zelf wat ze deelt.
                </p>
                <div className="mt-auto pt-8">
                  <Button full size="lg" onClick={() => setStep("value")}>
                    Verder
                  </Button>
                </div>
              </>
            )}

            {step === "value" && (
              <>
                <h1 className="text-2xl font-bold">Dit kan u nu al doen</h1>
                <p className="mt-2 text-sm text-muted">Zonder gegevens van Maria. Alles hieronder is van u.</p>
                <ChildSpace />
                <div className="pt-8">
                  <Button full size="lg" onClick={() => setStep("invite")}>
                    Nodig mama uit
                  </Button>
                </div>
              </>
            )}

            {step === "invite" && (
              <>
                <h1 className="text-2xl font-bold">Uw uitnodiging</h1>
                <p className="mt-2 text-sm text-muted">Maria krijgt dit bericht in haar KBC-app en per sms.</p>
                <div className="mt-5 rounded-3xl rounded-bl-md bg-white p-4 text-[15px] leading-relaxed shadow-sm ring-1 ring-line">
                  Dag mama, ik heb KBC Mantel gestart, zodat ik je kan helpen als je dat wil. Jij beslist wat ik mag zien of doen, en je kan altijd stoppen. Dikke kus, Sarah
                </div>
                <Card className="mt-4 space-y-2 text-sm">
                  <p className="font-semibold">Wat gebeurt er hierna?</p>
                  <p className="text-ink">Maria kiest zelf: wie haar helpt, welke rol en welke meldingen. Tot dan ziet u niets van haar rekeningen.</p>
                </Card>
                <div className="mt-auto pt-8">
                  <Button
                    full
                    size="lg"
                    loading={sending}
                    onClick={async () => {
                      setSending(true);
                      await wait(1200);
                      actions.startChildMantel("maria", "sarah");
                      setSending(false);
                      setStep("waiting");
                    }}
                  >
                    <Send className="size-4" aria-hidden /> Verstuur uitnodiging
                  </Button>
                </div>
              </>
            )}

            {step === "waiting" && (
              <>
                <span className="flex size-16 animate-pop items-center justify-center rounded-full bg-brand-soft text-navy">
                  <Clock className="size-8" aria-hidden />
                </span>
                <h1 className="mt-4 text-2xl font-bold">Wacht op goedkeuring van Maria</h1>
                <p className="mt-2 text-ink">Mooi dat u dit doet. Maria beslist nu in alle rust.</p>

                <Card className="mt-5 space-y-3">
                  <TimelineStep done label="Uitnodiging verstuurd" sub={s.pendingInvite ? shortDate(s.pendingInvite.at) : "net"} />
                  <TimelineStep active label="Maria bekijkt de uitnodiging" />
                  <TimelineStep label="Maria kiest wie wat mag" />
                </Card>

                <Card className="mt-3 flex items-start gap-3 bg-brand-mist ring-brand/20">
                  <EyeOff className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden />
                  <p className="text-sm text-ink">
                    <strong>Gedeeld met u: niets.</strong> Uw checklist, budget en diensten kan u intussen gewoon gebruiken.
                  </p>
                </Card>

                <div className="mt-auto space-y-2 pt-8">
                  <Button full size="lg" onClick={() => router.push("/app")}>
                    Naar mijn overzicht
                  </Button>
                  <Button
                    full
                    variant="soft"
                    onClick={() => {
                      actions.setViewer("maria", "maria");
                      router.push("/onboarding/ouder");
                    }}
                  >
                    Demo: Maria opent de uitnodiging
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input defaultValue={value} className="mt-1 h-12 w-full rounded-2xl bg-white px-4 text-[15px] ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-brand" />
    </label>
  );
}

function TimelineStep({ label, sub, done, active }: { label: string; sub?: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cx(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          done ? "bg-calm text-white" : active ? "bg-brand-soft text-navy" : "bg-canvas text-faint",
        )}
      >
        {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : active ? <Clock className="size-4" aria-hidden /> : <Circle className="size-3" aria-hidden />}
      </span>
      <span className={cx("flex-1 text-sm font-semibold", done || active ? "text-ink" : "text-muted")}>{label}</span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  );
}
