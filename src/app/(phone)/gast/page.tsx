"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { actions, useDemo } from "@/lib/store";
import { Avatar, Button, Card, RoleExplainer, Spinner, SuccessMark, wait } from "@/components/ui";

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
        <h1 className="mt-3 text-xl font-bold">Er is (nog) geen uitnodiging voor Tom</h1>
        <p className="mt-2 text-sm text-muted">Maria beslist zelf wie ze uitnodigt.</p>
        <Button
          className="mt-6"
          variant="soft"
          onClick={() => {
            actions.prepareStep(3);
            setStep("sms");
          }}
        >
          Demo: Maria nodigt Tom uit
        </Button>
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
            <span className="block text-[11px] text-muted">Sms · vandaag</span>
          </span>
        </div>
        <div className="flex-1 space-y-2 bg-[#f6f7f9] px-4 py-6">
          <p className="text-center text-[11px] text-muted">Vandaag 10:14</p>
          <div className="max-w-[85%] rounded-3xl rounded-bl-md bg-white p-3.5 text-[15px] leading-relaxed shadow-sm">
            Dag Tom, Maria Peeters nodigt u uit in haar KBC Mantel, met de rol <strong>Inzage</strong>. U hebt geen KBC-rekening nodig.
            <button type="button" onClick={() => setStep("landing")} className="mt-1 block font-semibold text-brand underline underline-offset-2">
              kbc.be/mantel/u/7KQ2
            </button>
          </div>
          <p className="pl-2 text-[11px] text-muted">Tik op de link om verder te gaan</p>
        </div>
      </div>
    );
  }

  if (step === "itsme" || step === "confirming") {
    return (
      <div className="flex min-h-full flex-col bg-itsme px-6 pb-10 pt-12 text-white">
        <p className="text-3xl font-black tracking-tight">itsme</p>
        <p className="mt-10 text-lg font-semibold">KBC Mantel vraagt om te bevestigen wie u bent</p>
        <div className="mt-6 space-y-3 rounded-3xl bg-white/15 p-5 text-[15px]">
          <p className="flex items-center gap-2">
            <Check className="size-4" aria-hidden /> Naam: Tom Peeters
          </p>
          <p className="flex items-center gap-2">
            <Check className="size-4" aria-hidden /> Geboortedatum
          </p>
          <p className="flex items-center gap-2">
            <Check className="size-4" aria-hidden /> Gsm-nummer
          </p>
        </div>
        <p className="mt-4 text-sm text-white/80">KBC krijgt geen toegang tot uw andere bankrekeningen.</p>
        <div className="mt-auto pt-10">
          {step === "confirming" ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-8" />
              <p className="font-semibold">Bevestigen…</p>
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
              Bevestig met uw itsme-code
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
        <h1 className="mt-6 text-2xl font-bold">U bent erbij, Tom</h1>
        <p className="mt-2 text-ink">U kan nu meekijken in de Mantel van Maria, met de rol Inzage.</p>
        <p className="mt-2 text-sm text-muted">Maria krijgt een bericht dat u aansloot.</p>
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
            Naar de Mantel van Maria <ChevronRight className="size-4" aria-hidden />
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
            <p className="text-sm text-white/70">Uitnodiging van</p>
            <p className="text-xl font-bold">Maria Peeters</p>
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold leading-tight">Welkom Tom. Uw mama vertrouwt u.</h1>
      </div>
      <main className="flex flex-1 flex-col px-4 pb-8 pt-5">
        <Card>
          <p className="mb-3 text-sm font-semibold text-muted">Maria koos voor u:</p>
          <RoleExplainer role="inzage" />
        </Card>
        <Card className="mt-3 flex items-start gap-3 bg-calm-soft ring-calm/20">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-calm" aria-hidden />
          <p className="text-sm text-ink">
            <strong>Geen KBC-rekening nodig.</strong> U sluit aan als gast. Bevestig gewoon wie u bent met itsme.
          </p>
        </Card>
        <div className="mt-auto pt-8">
          <Button full size="lg" variant="itsme" onClick={() => setStep("itsme")}>
            Verder met itsme
          </Button>
        </div>
      </main>
    </div>
  );
}
