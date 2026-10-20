"use client";

import Link from "next/link";
import { ChevronRight, HeartHandshake, Phone, ScrollText, ShieldCheck, Users } from "lucide-react";
import { PEOPLE, firstName } from "@/lib/data";
import { euro } from "@/lib/format";
import { actions, FRAUD_TX } from "@/lib/store";
import { useDemo } from "@/lib/store";
import { Avatar, Button, ButtonLink, toast } from "@/components/ui";

export default function MariaHome() {
  const s = useDemo();
  const pending = s.approvals.find((a) => a.elder === "maria" && a.status === "pending");
  const fraudOpen = s.fraud === "alert" || s.fraud === "calling" || s.fraud === "blocking";

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Dag Maria</h1>

      <div className="mt-5">
        {fraudOpen && s.fraudAnswer === "none" ? (
          <FocusCard tone="attention">
            <p className="text-lg font-semibold text-attention">Een vraag van KBC</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">Was u dit?</h2>
            <p className="mt-3 text-ink">
              Een overschrijving van <strong>{euro(FRAUD_TX.amount)}</strong> naar &ldquo;{FRAUD_TX.name}&rdquo;. We hebben ze tegengehouden.
            </p>
            <div className="mt-5 space-y-3">
              <Button full size="xl" onClick={() => actions.answerFraud()}>
                Nee, dat was ik niet
              </Button>
              <Button full size="xl" variant="secondary" onClick={() => toast("Bedankt. Bel ons even om het samen te bevestigen.")}>
                Ja, dat was ik
              </Button>
            </div>
          </FocusCard>
        ) : fraudOpen ? (
          <FocusCard tone="calm">
            <ShieldCheck className="size-10 text-calm" aria-hidden />
            <h2 className="mt-2 text-2xl font-bold text-ink">Goed dat u het zegt</h2>
            <p className="mt-2 text-ink">Uw geld staat nog op uw rekening. Sarah en Ann zijn verwittigd, zoals u zelf vroeg.</p>
          </FocusCard>
        ) : s.fraud === "resolved" ? (
          <FocusCard tone="calm">
            <ShieldCheck className="size-10 text-calm" aria-hidden />
            <h2 className="mt-2 text-2xl font-bold text-ink">Uw geld is veilig</h2>
            <p className="mt-2 text-ink">Sarah heeft de verdachte overschrijving samen met KBC gestopt. Morgen belt KBC u even.</p>
          </FocusCard>
        ) : pending ? (
          <FocusCard>
            <div className="flex items-center gap-3">
              <Avatar id={pending.requestedBy} size="lg" />
              <p className="text-lg font-semibold text-muted">{firstName(pending.requestedBy)} vraagt iets</p>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-ink">Mag deze betaling gebeuren?</h2>
            <ButtonLink href="/maria/goedkeuren" full size="xl" className="mt-5">
              Bekijken
            </ButtonLink>
          </FocusCard>
        ) : s.mantel.maria !== "active" ? (
          <FocusCard>
            <HeartHandshake className="size-10 text-brand" aria-hidden />
            <h2 className="mt-2 text-2xl font-bold text-ink">
              {s.pendingInvite ? `${firstName(s.pendingInvite.by)} nodigde u uit` : "Wie zou u vertrouwen?"}
            </h2>
            <p className="mt-2 text-ink">
              {s.pendingInvite
                ? "Sarah wil u helpen. U beslist zelf wat zij mag zien of doen."
                : "Kies iemand die u kan helpen als dat ooit nodig is. U beslist alles zelf."}
            </p>
            <ButtonLink href="/onboarding/ouder" full size="xl" className="mt-5">
              {s.pendingInvite ? "Uitnodiging bekijken" : "Iemand kiezen"}
            </ButtonLink>
          </FocusCard>
        ) : (
          <FocusCard tone="calm">
            <ShieldCheck className="size-10 text-calm" aria-hidden />
            <h2 className="mt-2 text-2xl font-bold text-ink">Alles is rustig</h2>
            <p className="mt-2 text-ink">Er is niets dat op u wacht.</p>
          </FocusCard>
        )}
      </div>

      {s.mantel.maria === "active" && (
        <nav className="mt-8 space-y-3">
          <BigLink href="/maria/toestemming" icon={Users} title="Wie helpt mij?" sub={helpers(s)} />
          <BigLink href="/maria/toestemming#logboek" icon={ScrollText} title="Wat deden ze?" sub="Alles wat uw familie deed" />
        </nav>
      )}

      <button
        type="button"
        onClick={() => toast("U wordt doorverbonden met KBC Live.")}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-xl font-semibold text-navy ring-2 ring-inset ring-line"
      >
        <Phone className="size-6" aria-hidden /> Bel KBC
      </button>
    </div>
  );
}

function helpers(s: ReturnType<typeof useDemo>) {
  const names = s.circles.maria.filter((m) => m.status !== "revoked").map((m) => PEOPLE[m.personId].firstName);
  return names.length ? names.join(", ") : "Nog niemand";
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
