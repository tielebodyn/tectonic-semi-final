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
  const [phase, setPhase] = useState<"ask" | "busy" | "approved" | "declined">("ask");
  const [doneId, setDoneId] = useState<string | null>(null);

  const approval = s.approvals.find((a) => a.id === doneId) ?? s.approvals.find((a) => a.elder === "maria" && a.status === "pending");

  if (!approval) {
    return (
      <div className="pt-10 text-center">
        <h1 className="text-3xl font-bold">Nothing is waiting for you</h1>
        <p className="mt-3 text-muted">If someone asks you something, you will see it here.</p>
        <ButtonLink href="/maria" size="xl" full className="mt-8">
          Back
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
        <h1 className="mt-6 text-3xl font-bold">{phase === "approved" ? "Paid" : "Not paid"}</h1>
        <p className="mt-3 text-ink">{phase === "approved" ? `We will let ${who} know the bill is paid.` : `We will let ${who} know you said no.`}</p>
        <ButtonLink href="/maria" size="xl" full variant="secondary" className="mt-8">
          Done
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
        <p className="text-xl font-semibold text-muted">{who} asks for your approval</p>
      </div>
      <h1 className="mt-6 text-3xl font-bold leading-tight text-ink">May {who} pay this?</h1>

      <div className="mt-6 rounded-3xl bg-canvas p-6">
        <p className="text-5xl font-bold tabular-nums text-ink">{euro(bill.amount)}</p>
        <p className="mt-3 text-2xl font-semibold text-ink">{bill.payee}</p>
        <p className="text-xl text-muted">{bill.description}</p>
      </div>

      <p className="mt-5 text-ink">This is more than €{s.limits.maria}, so we ask you first.</p>

      <div className="mt-8 space-y-3">
        <Button size="xl" full variant="calm" loading={phase === "busy"} onClick={() => decide(true)}>
          Yes, go ahead
        </Button>
        <Button size="xl" full variant="secondary" disabled={phase === "busy"} onClick={() => decide(false)}>
          No, don’t pay
        </Button>
      </div>
    </div>
  );
}
