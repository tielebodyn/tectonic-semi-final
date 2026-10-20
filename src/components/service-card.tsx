"use client";

import { useState } from "react";
import { Check, Landmark, Send, ShieldCheck } from "lucide-react";
import type { Service } from "@/lib/data";
import { ELDERS, fullName } from "@/lib/data";
import { euro } from "@/lib/format";
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
            {recommended && connected && <Badge tone="brand">aanbevolen voor {elderPerson.firstName}</Badge>}
            <Badge>{service.regions.join(" · ")}</Badge>
          </div>
        </div>
      </div>
      <p className="text-sm text-ink">{service.description}</p>

      {connected && why ? (
        <WhyThis label="Waarom aanbevolen?">
          <p>{why}</p>
          <p className="mt-1.5 text-xs text-muted">Op basis van signalen die {elderPerson.firstName} met de Mantel deelt. {service.partner} betaalt niet voor deze plek in de lijst.</p>
        </WhyThis>
      ) : (
        <WhyThis>
          <p>{service.generic} Getoond omdat de dienst actief is in {ELDERS[elder].region}.</p>
        </WhyThis>
      )}

      <div className="rounded-2xl bg-canvas p-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Prijsindicatie</p>
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
          <Check className="size-4" aria-hidden /> Aangevraagd{requested.withLoan ? " · met renovatielening-simulatie" : ""}
        </div>
      ) : (
        <Button full variant="primary" onClick={() => setOpen(true)}>
          {connected ? service.cta : "Info aanvragen"}
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
  const [moment, setMoment] = useState("Deze week");
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
          <h3 className="text-xl font-bold text-ink">Aangevraagd</h3>
          <p className="text-sm text-ink">{service.confirm}</p>
          {connected && <p className="text-sm text-muted">{elderName} krijgt hiervan een melding. Het staat ook in het logboek.</p>}
          {service.loan && loan && (
            <p className="rounded-2xl bg-brand-mist p-3 text-sm text-navy">
              De simulatie van de KBC Renovatielening staat klaar voor {elderName}. Een lening op haar naam vraagt altijd haar eigen handtekening.
            </p>
          )}
          <Button full onClick={close}>
            Klaar
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-base font-semibold text-ink">{service.name}</p>

          <div className="space-y-1 rounded-2xl bg-canvas p-3 text-sm">
            <p>
              <span className="text-muted">Voor: </span>
              {connected ? `${fullName(elder)}, ${ELDERS[elder].address}` : "Uzelf, als info"}
            </p>
            <p>
              <span className="text-muted">Contactpersoon: </span>
              {fullName(viewer)} (u)
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Wanneer past het?</p>
            <div className="flex flex-wrap gap-2">
              {["Zo snel mogelijk", "Deze week", "Volgende week"].map((m) => (
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
                  <p className="text-sm font-bold text-navy">Combineer met KBC Renovatielening</p>
                  <p className="text-xs text-muted">Simulatie, zonder verbintenis</p>
                </div>
                <Toggle checked={loan} onChange={setLoan} label="Renovatielening simuleren" />
              </div>
              {loan && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-brand-mist p-2">
                    <p className="text-[11px] text-muted">Bedrag</p>
                    <p className="text-sm font-bold tabular-nums">{euro(service.loan.amount).replace(",00", "")}</p>
                  </div>
                  <div className="rounded-xl bg-brand-mist p-2">
                    <p className="text-[11px] text-muted">Looptijd</p>
                    <p className="text-sm font-bold">{service.loan.months / 12} jaar</p>
                  </div>
                  <div className="rounded-xl bg-brand-mist p-2">
                    <p className="text-[11px] text-muted">Per maand</p>
                    <p className="text-sm font-bold tabular-nums">≈ {euro(service.loan.monthly)}</p>
                  </div>
                  <p className="col-span-3 text-[11px] text-muted">{service.loan.rate}. Na aftrek van de aanpassingspremie kan het bedrag lager liggen.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-2.5 rounded-2xl bg-calm-soft p-3 text-sm">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-calm" aria-hidden />
            <p className="text-ink">
              <span className="font-semibold">Wat delen we met {service.partner}?</span> {connected ? service.shares.replace("de ouder", elderName) : "enkel uw eigen contactgegevens"}. Geen saldo&rsquo;s of
              andere financiële gegevens.
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
              if (!connected) toast("Info aangevraagd.");
            }}
          >
            <Send className="size-4" aria-hidden /> {connected ? service.cta : "Info aanvragen"}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
