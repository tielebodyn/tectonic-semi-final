"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Circle, Clock, EyeOff, HeartHandshake, KeyRound, Send, ShieldCheck } from "lucide-react";
import { shortDate } from "@/lib/format";
import { actions, useDemo } from "@/lib/store";
import { ChildSpace } from "@/components/child-space";
import { Button, Card, cx, wait } from "@/components/ui";
import { LogoIcon } from "@/components/logo";

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
          <button type="button" onClick={() => setStep(back[step]!)} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Back">
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <button type="button" onClick={() => router.push("/app")} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Back to Home">
            <ArrowLeft className="size-5" />
          </button>
        )}
        <span className="flex items-center gap-2 text-[15px] font-bold">
          <LogoIcon onDark className="size-6" /> New Mantel
        </span>
        <span className="ml-auto text-xs text-white/70">{["intro", "who", "value", "invite", "waiting"].indexOf(step) + 1}/5</span>
      </header>

      <main className="flex flex-1 flex-col px-4 pb-8 pt-5">
        {alreadyActive && step === "intro" ? (
          <Card className="space-y-3 text-center">
            <ShieldCheck className="mx-auto size-8 text-calm" aria-hidden />
            <p className="font-semibold">Maria already has a Mantel</p>
            <p className="text-sm text-muted">She chose who helps her, and you’re already in her circle.</p>
            <Button onClick={() => router.push("/app")}>Go to Home</Button>
          </Card>
        ) : (
          <>
            {step === "intro" && (
              <>
                <HeartHandshake className="size-12 text-brand" aria-hidden />
                <h1 className="mt-4 text-2xl font-bold leading-tight">Start a Mantel for someone you care for</h1>
                <p className="mt-3 text-ink">You get support straight away: a checklist for carers, care services nearby and your own carer budget.</p>
                <Card className="mt-5 flex items-start gap-3 bg-brand-mist ring-brand/20">
                  <KeyRound className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden />
                  <p className="text-sm text-ink">
                    We don’t share anything about your mum until she agrees and chooses what you may do.
                  </p>
                </Card>
                <div className="mt-auto pt-8">
                  <Button full size="lg" onClick={() => setStep("who")}>
                    Get started
                  </Button>
                </div>
              </>
            )}

            {step === "who" && (
              <>
                <h1 className="text-2xl font-bold">Who are you caring for?</h1>
                <div className="mt-5 space-y-4">
                  <Field label="Name" value="Maria Peeters" />
                  <Field label="Relationship" value="My mother" />
                  <Field label="Mobile number" value="0475 12 34 56" />
                </div>
                <p className="mt-4 flex items-start gap-2 text-xs text-muted">
                  <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden />
                  We won’t tell you whether Maria banks with KBC. She decides what she shares.
                </p>
                <div className="mt-auto pt-8">
                  <Button full size="lg" onClick={() => setStep("value")}>
                    Continue
                  </Button>
                </div>
              </>
            )}

            {step === "value" && (
              <>
                <h1 className="text-2xl font-bold">What you can do now</h1>
                <p className="mt-2 text-sm text-muted">None of this uses Maria’s data.</p>
                <ChildSpace />
                <div className="pt-8">
                  <Button full size="lg" onClick={() => setStep("invite")}>
                    Invite Mum
                  </Button>
                </div>
              </>
            )}

            {step === "invite" && (
              <>
                <h1 className="text-2xl font-bold">Your invitation</h1>
                <p className="mt-2 text-sm text-muted">Maria gets this message in KBC Mobile and by text.</p>
                <div className="mt-5 rounded-3xl rounded-bl-md bg-white p-4 text-[15px] leading-relaxed shadow-sm ring-1 ring-line">
                  Hi Mum, I’ve set up KBC Mantel so I can give you a hand with the bank things when you want me to. You decide what I can see or do, and you can stop it whenever you like. No rush, we can look at it together on Sunday. Love, Sarah x
                </div>
                <Card className="mt-4 space-y-2 text-sm">
                  <p className="font-semibold">What happens next?</p>
                  <p className="text-ink">Maria chooses who helps her, what each person may do and when we alert them. Until then, you see nothing of her accounts.</p>
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
                    <Send className="size-4" aria-hidden /> Send invitation
                  </Button>
                </div>
              </>
            )}

            {step === "waiting" && (
              <>
                <span className="flex size-16 animate-pop items-center justify-center rounded-full bg-brand-soft text-navy">
                  <Clock className="size-8" aria-hidden />
                </span>
                <h1 className="mt-4 text-2xl font-bold">Waiting for Maria</h1>
                <p className="mt-2 text-ink">Maria can take her time to decide. We’ll let you know when she does.</p>

                <Card className="mt-5 space-y-3">
                  <TimelineStep done label="Invitation sent" sub={s.pendingInvite ? shortDate(s.pendingInvite.at) : "just now"} />
                  <TimelineStep active label="Maria reads the invitation" />
                  <TimelineStep label="Maria chooses who may do what" />
                </Card>

                <Card className="mt-3 flex items-start gap-3 bg-brand-mist ring-brand/20">
                  <EyeOff className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden />
                  <p className="text-sm text-ink">
                    Maria hasn’t shared anything with you yet. In the meantime, you can use your checklist, budget and services.
                  </p>
                </Card>

                <div className="mt-auto space-y-2 pt-8">
                  <Button full size="lg" onClick={() => router.push("/app")}>
                    Go to Home
                  </Button>
                  <Button
                    full
                    variant="soft"
                    onClick={() => {
                      actions.setViewer("maria", "maria");
                      router.push("/onboarding/ouder");
                    }}
                  >
                    Demo: Maria opens the invitation
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
