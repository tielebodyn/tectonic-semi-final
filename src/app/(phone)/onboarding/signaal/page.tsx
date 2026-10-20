"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, KeyRound, Mail, Pill, ShoppingCart, Stethoscope, Hospital, UserCheck, Undo2, Users } from "lucide-react";
import { SeniorHeader } from "@/components/shell/senior-header";
import { Button, WhyThis, toast } from "@/components/ui";

type Step = "message" | "noticed" | "question" | "explain" | "later";

export default function SignalOnboardingPage() {
  const router = useRouter();
  return (
    <Fragment key={router.bfcacheId}>
      <SignalOnboarding />
    </Fragment>
  );
}

function SignalOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("message");

  return (
    <div className="flex min-h-full flex-col bg-white">
      <SeniorHeader label="KBC" />
      <main className="flex flex-1 flex-col px-5 pb-10 pt-2 text-xl leading-relaxed">
        {step === "message" && (
          <>
            <h1 className="text-3xl font-bold">Dag Maria</h1>
            <div className="mt-6 rounded-3xl bg-brand-mist p-6 ring-2 ring-brand/20">
              <p className="flex items-center gap-2 text-lg font-semibold text-navy">
                <Mail className="size-6" aria-hidden /> Een bericht van KBC
              </p>
              <p className="mt-3 text-2xl font-bold leading-snug text-ink">We merkten enkele veranderingen op uw rekening. Mogen we u iets vragen?</p>
              <p className="mt-3 text-ink">Er is niets mis. We willen u gewoon goed helpen.</p>
            </div>
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => setStep("noticed")}>
                Lees het bericht
              </Button>
            </div>
          </>
        )}

        {step === "noticed" && (
          <>
            <h1 className="text-3xl font-bold">Wat zagen we?</h1>
            <ul className="mt-6 space-y-4">
              {[
                { icon: Stethoscope, text: "Sinds september betaalt u elke maand aan Wit-Gele Kruis." },
                { icon: Pill, text: "U betaalt vaker bij de apotheek." },
                { icon: ShoppingCart, text: "U doet minder boodschappen in de supermarkt." },
                { icon: Hospital, text: "Vorige maand betaalde uw hospitalisatieverzekering een opname terug." },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-canvas text-navy">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span className="pt-1.5 text-ink">{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <WhyThis large>
                <p>KBC kijkt naar veranderingen in uw betalingen, om u op tijd de juiste hulp aan te bieden.</p>
                <p className="mt-2 font-semibold">Alleen u ziet dit bericht. We vertellen niets aan uw familie.</p>
              </WhyThis>
            </div>
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => setStep("question")}>
                Verder
              </Button>
            </div>
          </>
        )}

        {step === "question" && (
          <>
            <HeartHandshake className="size-14 text-brand" aria-hidden />
            <h1 className="mt-4 text-3xl font-bold leading-tight">Wilt u dat iemand die u vertrouwt u kan helpen, als dat nodig is?</h1>
            <p className="mt-4 text-ink">Bijvoorbeeld om een rekening te betalen, of om u te verwittigen als er iets vreemds gebeurt.</p>
            <div className="mt-auto space-y-3 pt-8">
              <Button size="xl" full onClick={() => setStep("explain")}>
                Ja, vertel me meer
              </Button>
              <Button size="xl" full variant="secondary" onClick={() => setStep("later")}>
                Nu niet
              </Button>
              <button type="button" onClick={() => toast("Een medewerker van KBC belt u vandaag nog.")} className="w-full py-3 text-lg font-semibold text-navy underline underline-offset-4">
                Ik praat liever met iemand van KBC
              </button>
            </div>
          </>
        )}

        {step === "explain" && (
          <>
            <h1 className="text-3xl font-bold">Zo werkt KBC Mantel</h1>
            <ul className="mt-6 space-y-5">
              {[
                { icon: Users, title: "U kiest wie", text: "Uw dochter, uw zoon, een buur. Alleen wie u kiest." },
                { icon: UserCheck, title: "U kiest wat ze mogen", text: "Een bericht krijgen, meekijken of betalen tot een bedrag dat u kiest." },
                { icon: Undo2, title: "U kan altijd stoppen", text: "Met één tik. Zonder uitleg." },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-navy">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-2xl font-bold text-ink">{title}</span>
                    <span className="block text-ink">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-3 rounded-3xl bg-canvas p-5 text-ink">
              <KeyRound className="mt-1 size-6 shrink-0 text-navy" aria-hidden /> U houdt de sleutel. KBC doet alleen wat u zelf beslist.
            </p>
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => router.push("/onboarding/ouder")}>
                Iemand kiezen
              </Button>
            </div>
          </>
        )}

        {step === "later" && (
          <>
            <h1 className="text-3xl font-bold">Dat is goed</h1>
            <p className="mt-4 text-ink">We vragen het niet opnieuw. U vindt KBC Mantel altijd terug in uw KBC-app, als u het later toch wil.</p>
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => router.push("/maria")}>
                Terug naar de app
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
