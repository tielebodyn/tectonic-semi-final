"use client";

import { useState } from "react";
import { Check, Landmark, Send, ShieldCheck } from "lucide-react";
import type { Service } from "@/lib/data";
import { ELDERS, fullName, poss } from "@/lib/data";
import { euro, euro0 } from "@/lib/format";
import { actions } from "@/lib/store";
import { useCurrent } from "@/lib/use-current";
import { Badge, Button, Card, Sheet, SuccessMark, Toggle, WhyThis, cx, toast, wait } from "@/components/ui";

export function ServiceCard({ service, recommended }: { service: Service; recommended: boolean }) {
  const { s, elder, elderPerson, viewer, link } = useCurrent();
  const connected = link?.state === "active";
  const why = service.why[elder];
  const requested = s.requested[elder].find((r) => r.serviceId === service.id);
  const [open, setOpen] = useState(false);

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <span className={cx("flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ring-1 ring-inset", service.tone)}>{service.monogram}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted">{service.partner}</p>
          <h3 className="font-bold leading-snug text-ink">{service.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {recommended && connected && <Badge tone="brand">recommended for {elderPerson.firstName}</Badge>}
            <Badge>{service.regions.join(" · ")}</Badge>
          </div>
        </div>
      </div>
      <p className="text-sm text-ink">{service.description}</p>

      {connected && why ? (
        <WhyThis label="Why is this recommended?">
          <p>{why}</p>
          <p className="mt-1.5 text-xs text-muted">Based on insights {elderPerson.firstName} shares through the Mantel. {service.partner} doesn&rsquo;t pay for this place in the list.</p>
        </WhyThis>
      ) : (
        <WhyThis>
          <p>{service.generic} Shown because this service is available in {ELDERS[elder].region}.</p>
        </WhyThis>
      )}

      <div className="rounded-2xl bg-canvas p-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Price indication</p>
        <p className="mt-0.5 text-ink">{service.price}</p>
      </div>

      {service.kbc && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-brand-mist p-3 text-sm ring-1 ring-inset ring-brand/15">
          <Landmark className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden />
          <p>
            <span className="font-semibold text-navy">{service.kbc.product}</span>
            <span className="text-ink"> · {service.kbc.detail}</span>
          </p>
        </div>
      )}

      {requested ? (
        <div className="flex items-center gap-2 rounded-full bg-calm-soft px-4 py-2.5 text-sm font-semibold text-calm">
          <Check className="size-4" aria-hidden /> Requested{requested.withLoan ? " · with loan simulation" : ""}
        </div>
      ) : (
        <Button full variant="primary" onClick={() => setOpen(true)}>
          {connected ? service.cta : "Request info"}
        </Button>
      )}

      <RequestSheet service={service} open={open} onClose={() => setOpen(false)} connected={connected} elderName={elderPerson.firstName} elder={elder} viewer={viewer} />
    </Card>
  );
}

function RequestSheet({
  service,
  open,
  onClose,
  connected,
  elderName,
  elder,
  viewer,
}: {
  service: Service;
  open: boolean;
  onClose: () => void;
  connected: boolean;
  elderName: string;
  elder: ReturnType<typeof useCurrent>["elder"];
  viewer: ReturnType<typeof useCurrent>["viewer"];
}) {
  const [phase, setPhase] = useState<"form" | "sending" | "done">("form");
  const [moment, setMoment] = useState("This week");
  const [loan, setLoan] = useState(true);

  const close = () => {
    onClose();
    setPhase("form");
  };

  return (
    <Sheet open={open} onClose={close} title={phase === "done" ? undefined : `${service.partner}`}>
      {phase === "done" ? (
        <div className="space-y-4 py-4 text-center">
          <SuccessMark />
          <h3 className="text-xl font-bold text-ink">Requested</h3>
          <p className="text-sm text-ink">{service.confirm}</p>
          {connected && <p className="text-sm text-muted">{elderName} gets a notification about it. It&rsquo;s also in the activity log.</p>}
          {service.loan && loan && (
            <p className="rounded-2xl bg-brand-mist p-3 text-sm text-navy">
              The KBC Renovation Loan simulation is ready for {elderName} to look at. A loan in {poss(elder)} name always needs {poss(elder)} own signature.
            </p>
          )}
          <Button full onClick={close}>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-base font-semibold text-ink">{service.name}</p>

          <div className="space-y-1 rounded-2xl bg-canvas p-3 text-sm">
            <p>
              <span className="text-muted">For: </span>
              {connected ? `${fullName(elder)}, ${ELDERS[elder].address}` : "Yourself, for information"}
            </p>
            <p>
              <span className="text-muted">Contact person: </span>
              {fullName(viewer)} (you)
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">When suits you?</p>
            <div className="flex flex-wrap gap-2">
              {["As soon as possible", "This week", "Next week"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMoment(m)}
                  className={cx("rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset", moment === m ? "bg-navy text-white ring-navy" : "text-navy ring-line")}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {service.loan && connected && (
            <div className="space-y-3 rounded-2xl p-3 ring-1 ring-inset ring-brand/30">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-navy">Add a KBC Renovation Loan</p>
                  <p className="text-xs text-muted">Simulation, no commitment</p>
                </div>
                <Toggle checked={loan} onChange={setLoan} label="Simulate a KBC Renovation Loan" />
              </div>
              {loan && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-brand-mist p-2">
                    <p className="text-[11px] text-muted">Amount</p>
                    <p className="text-sm font-bold tabular-nums">{euro0(service.loan.amount)}</p>
                  </div>
                  <div className="rounded-xl bg-brand-mist p-2">
                    <p className="text-[11px] text-muted">Term</p>
                    <p className="text-sm font-bold">{service.loan.months / 12} years</p>
                  </div>
                  <div className="rounded-xl bg-brand-mist p-2">
                    <p className="text-[11px] text-muted">Per month</p>
                    <p className="text-sm font-bold tabular-nums">≈ {euro(service.loan.monthly)}</p>
                  </div>
                  <p className="col-span-3 text-[11px] text-muted">{service.loan.rate}. An adaptation grant can lower the amount. Only {elderName} can sign the loan. Remember, borrowing money also costs money.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-2.5 rounded-2xl bg-calm-soft p-3 text-sm">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-calm" aria-hidden />
            <p className="text-ink">
              <span className="font-semibold">What do we share with {service.partner}?</span> {connected ? service.shares.replace("the parent's", `${elderName}'s`) : "only your own contact details"}. No balances or other
              financial information.
            </p>
          </div>

          <Button
            full
            size="lg"
            loading={phase === "sending"}
            onClick={async () => {
              setPhase("sending");
              await wait(1300);
              if (connected) actions.requestService(elder, service.id, service.partner, viewer, !!service.loan && loan);
              setPhase("done");
              if (!connected) toast("Info requested.");
            }}
          >
            <Send className="size-4" aria-hidden /> {connected ? service.cta : "Request info"}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
