"use client";

import { Eye, RotateCcw, Sparkles } from "lucide-react";
import { SIGNALS, poss, subj } from "@/lib/data";
import { actions } from "@/lib/store";
import { useCurrent } from "@/lib/use-current";
import { SignalCard } from "@/components/signal-card";
import { Card, LockedNotice } from "@/components/ui";

export default function SignalsPage() {
  const { s, elder, elderPerson, canView, link } = useCurrent();
  const name = elderPerson.firstName;

  if (!link || !canView) {
    return <LockedNotice title="Signalen zijn niet gedeeld met u" body={`Met uw rol krijgt u enkel meldingen volgens de regels die ${name} koos.`} />;
  }

  const all = SIGNALS.filter((x) => x.elder === elder);
  const visible = all.filter((x) => !s.dismissed.includes(x.id));
  const hidden = all.length - visible.length;

  return (
    <div>
      <h1 className="px-1 text-2xl font-bold tracking-tight">Wat KBC opmerkte</h1>
      <p className="mt-1 px-1 text-sm text-muted">
        Kleine veranderingen die kunnen helpen om {name} goed te ondersteunen. Altijd met een uitleg, en u kan ze verbergen.
      </p>

      <Card className="mt-4 flex items-start gap-3 bg-brand-mist p-3.5 ring-brand/15">
        <Eye className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden />
        <p className="text-xs text-ink">
          {name} gaf toestemming om deze signalen met {poss(elder)} Mantel te delen. {subj(elder) === "zij" ? "Zij" : "Hij"} ziet ze zelf ook, en kan dit altijd stoppen.
        </p>
      </Card>

      <div className="mt-4 space-y-3">
        {visible.map((sig) => (
          <SignalCard key={sig.id} signal={sig} />
        ))}
      </div>

      {visible.length === 0 && (
        <Card className="mt-4 py-10 text-center">
          <Sparkles className="mx-auto size-8 text-brand" aria-hidden />
          <p className="mt-2 font-semibold">Geen nieuwe signalen</p>
          <p className="text-sm text-muted">We laten het weten als we iets opmerken.</p>
        </Card>
      )}

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => all.forEach((x) => actions.restoreSignal(x.id))}
          className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-navy"
        >
          <RotateCcw className="size-4" aria-hidden /> {hidden} verborgen {hidden === 1 ? "signaal" : "signalen"} terugzetten
        </button>
      )}
    </div>
  );
}
