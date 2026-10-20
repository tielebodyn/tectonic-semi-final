"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, KeyRound, Mail, Pill, ShoppingCart, Stethoscope, Hospital, UserCheck, Undo2, Users } from "lucide-react";
import { SeniorHeader } from "@/components/shell/senior-header";
import { Button, WhyThis, toast } from "@/components/ui";
import { useSceneValue } from "@/lib/tour";

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
  const [stepLocal, setStep] = useState<Step>("message");
  const step = useSceneValue<Step>("signal.step") ?? stepLocal;
  const whyOpen = useSceneValue<boolean>("signal.why");

  return (
    <div className="flex min-h-full flex-col bg-white">
      <SeniorHeader />
      <main className="flex flex-1 flex-col px-5 pb-10 pt-2 text-xl leading-relaxed">
        {step === "message" && (
          <>
            <h1 className="text-3xl font-bold">Hello Maria</h1>
            <div className="mt-6 rounded-3xl bg-brand-mist p-6 ring-2 ring-brand/20">
              <p className="flex items-center gap-2 text-lg font-semibold text-navy">
                <Mail className="size-6" aria-hidden /> A message from KBC
              </p>
              <p className="mt-3 text-2xl font-bold leading-snug text-ink">We noticed a few changes on your account. May we ask you something?</p>
              <p className="mt-3 text-ink">There’s nothing wrong with your account. We’d like to see if we can help.</p>
            </div>
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => setStep("noticed")}>
                Read the message
              </Button>
            </div>
          </>
        )}

        {step === "noticed" && (
          <>
            <h1 className="text-3xl font-bold">What did we notice?</h1>
            <ul className="mt-6 space-y-4">
              {[
                { icon: Stethoscope, text: "Since September, you pay Wit-Gele Kruis every month." },
                { icon: Pill, text: "You pay at the pharmacy more often." },
                { icon: ShoppingCart, text: "You shop less at the supermarket." },
                { icon: Hospital, text: "Last month, your KBC Hospitalisation Insurance paid back a hospital stay." },
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
              <WhyThis large forceOpen={whyOpen}>
                <p>We look at changes in your payments, so we can offer the right help in good time.</p>
                <p className="mt-2 font-semibold">Only you can see this message. We don’t tell your family anything.</p>
              </WhyThis>
            </div>
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => setStep("question")}>
                Continue
              </Button>
            </div>
          </>
        )}

        {step === "question" && (
          <>
            <HeartHandshake className="size-14 text-brand" aria-hidden />
            <h1 className="mt-4 text-3xl font-bold leading-tight">Would you like someone you trust to be able to help you, if needed?</h1>
            <p className="mt-4 text-ink">For example, to pay a bill, or to let you know if something odd happens.</p>
            <div className="mt-auto space-y-3 pt-8">
              <Button size="xl" full onClick={() => setStep("explain")}>
                Yes, tell me more
              </Button>
              <Button size="xl" full variant="secondary" onClick={() => setStep("later")}>
                Not now
              </Button>
              <button type="button" onClick={() => toast("A KBC Live expert will call you today.")} className="w-full py-3 text-lg font-semibold text-navy underline underline-offset-4">
                I’d rather talk to someone at KBC
              </button>
            </div>
          </>
        )}

        {step === "explain" && (
          <>
            <h1 className="text-3xl font-bold">How KBC Mantel works</h1>
            <ul className="mt-6 space-y-5">
              {[
                { icon: Users, title: "You choose who", text: "For example your daughter, your son or a neighbour." },
                { icon: UserCheck, title: "You choose what they may do", text: "Get an alert, see your accounts, or pay bills up to an amount you set." },
                { icon: Undo2, title: "You can stop at any time", text: "You can do this yourself in KBC Mobile." },
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
              <KeyRound className="mt-1 size-6 shrink-0 text-navy" aria-hidden /> We only share what you agree to.
            </p>
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => router.push("/onboarding/ouder")}>
                Choose someone
              </Button>
            </div>
          </>
        )}

        {step === "later" && (
          <>
            <h1 className="text-3xl font-bold">That’s fine</h1>
            <p className="mt-4 text-ink">We won’t ask again. If you change your mind, you’ll find KBC Mantel in KBC Mobile.</p>
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => router.push("/maria")}>
                Back to the app
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
