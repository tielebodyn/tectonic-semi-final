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
    return <LockedNotice title="Insights aren't shared with you" body={`With your role, you only get alerts based on the rules ${name} chose.`} />;
  }

  const all = SIGNALS.filter((x) => x.elder === elder);
  const visible = all.filter((x) => !s.dismissed.includes(x.id));
  const hidden = all.length - visible.length;

  return (
    <div>
      <h1 className="px-1 text-2xl font-bold tracking-tight">What Kate noticed</h1>
      <p className="mt-1 px-1 text-sm text-muted">
        Kate, KBC&rsquo;s digital assistant, spots small changes in {name}&rsquo;s banking that may mean {subj(elder)} could use some support. Each insight says why you&rsquo;re seeing it. You can hide any of them.
      </p>

      <Card className="mt-4 flex items-start gap-3 bg-brand-mist p-3.5 ring-brand/15">
        <Eye className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden />
        <p className="text-xs text-ink">
          {name} agreed to share these insights with {poss(elder)} Mantel. {subj(elder) === "she" ? "She" : "He"} sees them too, and can stop sharing at any time.
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
          <p className="mt-2 font-semibold">Nothing new</p>
          <p className="text-sm text-muted">Kate will let you know when she notices something.</p>
        </Card>
      )}

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => all.forEach((x) => actions.restoreSignal(x.id))}
          className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-navy"
        >
          <RotateCcw className="size-4" aria-hidden /> Show {hidden} hidden {hidden === 1 ? "insight" : "insights"}
        </button>
      )}
    </div>
  );
}
