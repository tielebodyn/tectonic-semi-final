"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { ROLES } from "@/lib/data";
import { actions, useDemo } from "@/lib/store";
import { Avatar, Button, ButtonLink, Card, RoleExplainer, Spinner, SuccessMark, wait } from "@/components/ui";

type Step = "sms" | "landing" | "itsme" | "confirming" | "done";

export default function GuestPage() {
  const router = useRouter();
  return (
    <Fragment key={router.bfcacheId}>
      <GuestFlow />
    </Fragment>
  );
}

function GuestFlow() {
  const s = useDemo();
  const router = useRouter();
  const [step, setStep] = useState<Step>("sms");
  const tom = s.mantel.maria === "active" ? s.circles.maria.find((m) => m.personId === "tom") : undefined;

  if (!tom || tom.status === "revoked") {
    return (
      <div className="p-6 pt-16 text-center">
        <Lock className="mx-auto size-8 text-muted" aria-hidden />
        <h1 className="mt-3 text-xl font-bold">There’s no invitation for Tom (yet)</h1>
        <p className="mt-2 text-sm text-muted">Maria decides who she invites.</p>
        <ButtonLink href="/" className="mt-6" variant="soft">
          Back to the demo
        </ButtonLink>
      </div>
    );
  }

  if (step === "sms") {
    return (
      <div className="flex min-h-full flex-col bg-white">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <ArrowLeft className="size-5 text-brand" aria-hidden />
          <span className="flex size-9 items-center justify-center rounded-full bg-navy text-white">
            <KeyRound className="size-4" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold">KBC Mantel</span>
            <span className="block text-[11px] text-muted">Text message · today</span>
          </span>
        </div>
        <div className="flex-1 space-y-2 bg-[#f6f7f9] px-4 py-6">
          <p className="text-center text-[11px] text-muted">Today 10:14</p>
          <div className="max-w-[85%] rounded-3xl rounded-bl-md bg-white p-3.5 text-[15px] leading-relaxed shadow-sm">
            Hello Tom, Maria Peeters has invited you to her KBC Mantel, with the <strong>{ROLES.inzage.label}</strong> role. You don’t need a KBC account.
            <button type="button" onClick={() => setStep("landing")} className="mt-1 block font-semibold text-brand underline underline-offset-2">
              kbc.be/mantel/u/7KQ2
            </button>
          </div>
          <p className="pl-2 text-[11px] text-muted">Tap the link to continue</p>
        </div>
      </div>
    );
  }

  if (step === "itsme" || step === "confirming") {
    return (
      <div className="flex min-h-full flex-col bg-itsme px-6 pb-10 pt-12 text-white">
        <p className="text-3xl font-black tracking-tight">itsme</p>
        <p className="mt-10 text-lg font-semibold">KBC Mantel asks you to confirm who you are</p>
        <div className="mt-6 space-y-3 rounded-3xl bg-white/15 p-5 text-[15px]">
          <p className="flex items-center gap-2">
            <Check className="size-4" aria-hidden /> Name: Tom Peeters
          </p>
          <p className="flex items-center gap-2">
            <Check className="size-4" aria-hidden /> Date of birth
          </p>
          <p className="flex items-center gap-2">
            <Check className="size-4" aria-hidden /> Mobile number
          </p>
        </div>
        <p className="mt-4 text-sm text-white/80">KBC gets no access to your accounts at other banks.</p>
        <div className="mt-auto pt-10">
          {step === "confirming" ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-8" />
              <p className="font-semibold">Confirming…</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={async () => {
                setStep("confirming");
                await wait(1600);
                setStep("done");
              }}
              className="h-14 w-full rounded-2xl bg-white text-lg font-bold text-itsme"
            >
              Confirm with your itsme code
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex min-h-full flex-col px-5 pb-10 pt-16 text-center">
        <SuccessMark large />
        <h1 className="mt-6 text-2xl font-bold">Welcome to Maria’s Mantel</h1>
        <p className="mt-2 text-ink">You can now see Maria’s Mantel, with the {ROLES.inzage.label} role.</p>
        <p className="mt-2 text-sm text-muted">We’ll let Maria know you’ve joined.</p>
        <div className="mt-auto pt-10">
          <Button
            full
            size="lg"
            onClick={() => {
              if (tom.status === "active") actions.setViewer("tom", "maria");
              else actions.completeGuestJoin("maria", "tom");
              router.push("/app");
            }}
          >
            Go to Maria’s Mantel <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="bg-navy px-5 pb-8 pt-6 text-white">
        <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <KeyRound className="size-4" aria-hidden /> KBC Mantel
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Avatar id="maria" size="xl" ring />
          <div>
            <p className="text-sm text-white/70">Invitation from</p>
            <p className="text-xl font-bold">Maria Peeters</p>
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold leading-tight">Welcome, Tom</h1>
      </div>
      <main className="flex flex-1 flex-col px-4 pb-8 pt-5">
        <Card>
          <p className="mb-3 text-sm font-semibold text-muted">Maria chose this for you:</p>
          <RoleExplainer role="inzage" />
        </Card>
        <Card className="mt-3 flex items-start gap-3 bg-calm-soft ring-calm/20">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-calm" aria-hidden />
          <p className="text-sm text-ink">
            You don’t need a KBC account. You join as a guest and confirm who you are with itsme.
          </p>
        </Card>
        <div className="mt-auto pt-8">
          <Button full size="lg" variant="itsme" onClick={() => setStep("itsme")}>
            Continue with itsme
          </Button>
        </div>
      </main>
    </div>
  );
}
