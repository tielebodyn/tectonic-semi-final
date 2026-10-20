"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { firstName } from "@/lib/data";
import { euro } from "@/lib/format";
import { actions, useDemo } from "@/lib/store";
import { Avatar, Button, ButtonLink, SuccessMark, wait } from "@/components/ui";

export default function ApprovalPage() {
  const router = useRouter();
  return (
    <Fragment key={router.bfcacheId}>
      <Approval />
    </Fragment>
  );
}

function Approval() {
  const s = useDemo();
  const router = useRouter();
  const [phase, setPhase] = useState<"ask" | "busy" | "approved" | "declined">("ask");
  const [doneId, setDoneId] = useState<string | null>(null);

  const approval = s.approvals.find((a) => a.id === doneId) ?? s.approvals.find((a) => a.elder === "maria" && a.status === "pending");

  if (!approval) {
    return (
      <div className="pt-10 text-center">
        <h1 className="text-3xl font-bold">Er wacht niets op u</h1>
        <p className="mt-3 text-muted">Als iemand iets vraagt, ziet u het hier.</p>
        <ButtonLink href="/maria" size="xl" full className="mt-8">
          Terug
        </ButtonLink>
      </div>
    );
  }

  const bill = s.bills.maria.find((b) => b.id === approval.billId)!;
  const who = firstName(approval.requestedBy);

  if (phase === "approved" || phase === "declined") {
    return (
      <div className="pt-6 text-center">
        <SuccessMark large />
        <h1 className="mt-6 text-3xl font-bold">{phase === "approved" ? "Betaald" : "Niet betaald"}</h1>
        <p className="mt-3 text-ink">{phase === "approved" ? `${who} krijgt bericht dat de betaling gebeurd is.` : `${who} krijgt bericht dat u nee zei.`}</p>
        <Button
          size="xl"
          full
          className="mt-8"
          onClick={() => {
            actions.setViewer("sarah", "maria");
            router.push("/app/logboek");
          }}
          variant="soft"
        >
          Demo: terug naar Sarah
        </Button>
        <ButtonLink href="/maria" size="xl" full variant="secondary" className="mt-3">
          Klaar
        </ButtonLink>
      </div>
    );
  }

  const decide = async (approve: boolean) => {
    setPhase("busy");
    setDoneId(approval.id);
    await wait(1100);
    actions.decideApproval(approval.id, approve);
    setPhase(approve ? "approved" : "declined");
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar id={approval.requestedBy} size="xl" />
        <p className="text-xl font-semibold text-muted">{who} vraagt uw goedkeuring</p>
      </div>
      <h1 className="mt-6 text-3xl font-bold leading-tight text-ink">Mag {who} dit betalen?</h1>

      <div className="mt-6 rounded-3xl bg-canvas p-6">
        <p className="text-5xl font-bold tabular-nums text-ink">{euro(bill.amount)}</p>
        <p className="mt-3 text-2xl font-semibold text-ink">{bill.payee}</p>
        <p className="text-xl text-muted">{bill.description}</p>
      </div>

      <p className="mt-5 text-ink">Dit is meer dan €{s.limits.maria}. Daarom vragen we het eerst aan u.</p>

      <div className="mt-8 space-y-3">
        <Button size="xl" full variant="calm" loading={phase === "busy"} onClick={() => decide(true)}>
          Ja, dat mag
        </Button>
        <Button size="xl" full variant="secondary" disabled={phase === "busy"} onClick={() => decide(false)}>
          Nee, liever niet
        </Button>
      </div>
    </div>
  );
}
