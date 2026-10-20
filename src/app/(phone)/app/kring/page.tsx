"use client";

import { useState } from "react";
import { BadgeCheck, Fingerprint, KeyRound, Mail, UserPlus } from "lucide-react";
import { PEOPLE, ROLES, fullName, poss } from "@/lib/data";
import { longDate } from "@/lib/format";
import { useCurrent } from "@/lib/use-current";
import type { RoleId } from "@/lib/types";
import { Avatar, Badge, Button, Card, RoleBadge, RoleExplainer, SectionTitle, Sheet, toast, wait } from "@/components/ui";

export default function CirclePage() {
  const { s, elder, elderPerson, viewer, link, limit } = useCurrent();
  const [suggest, setSuggest] = useState(false);
  const [sending, setSending] = useState(false);
  const name = elderPerson.firstName;

  if (!link || link.state !== "active") {
    return <p className="py-10 text-center text-sm text-muted">De kring wordt zichtbaar zodra {name} uw uitnodiging aanvaardt.</p>;
  }

  const members = s.circles[elder].filter((m) => m.status !== "revoked");

  return (
    <div>
      <h1 className="px-1 text-2xl font-bold tracking-tight">De kring van {name}</h1>
      <p className="mt-1 px-1 text-sm text-muted">Iedereen die {name} vertrouwt, en wat ze mogen.</p>

      <Card className="mt-4 flex items-center gap-3 bg-brand-mist ring-brand/20">
        <Avatar id={elder} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">{fullName(elder)}</p>
          <p className="text-xs text-muted">Eigenaar van de Mantel</p>
        </div>
        <Badge tone="navy">
          <KeyRound className="size-3" aria-hidden /> houdt de sleutel
        </Badge>
      </Card>
      <p className="mt-2 px-1 text-xs text-muted">
        {name} kiest wie erbij hoort en welke rol. {name} kan een rol aanpassen of toegang stoppen wanneer {poss(elder) === "haar" ? "ze" : "hij"} wil.
      </p>

      <SectionTitle>{members.length} vertrouwenspersonen</SectionTitle>
      <div className="space-y-2.5">
        {members.map((m) => {
          const p = PEOPLE[m.personId];
          return (
            <Card key={m.personId} className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar id={m.personId} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">
                    {p.firstName} {p.lastName} {m.personId === viewer && <span className="font-medium text-muted">(u)</span>}
                  </p>
                  <p className="text-sm text-muted">{m.relation}</p>
                </div>
                <RoleBadge role={m.role} />
              </div>
              <p className="text-sm text-ink">
                {m.role === "handelen" ? `Kan rekeningen betalen tot €${limit} per betaling. Daarboven beslist ${name}.` : ROLES[m.role].short}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {m.guest ? (
                  <Badge>
                    <Fingerprint className="size-3" aria-hidden /> gast{m.status === "active" ? " via itsme" : ""}
                  </Badge>
                ) : (
                  <Badge tone="brand">
                    <BadgeCheck className="size-3" aria-hidden /> KBC-klant
                  </Badge>
                )}
                {m.status === "invited" ? <Badge tone="attention">uitgenodigd</Badge> : <Badge>sinds {longDate(m.since)}</Badge>}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4 space-y-3">
        <p className="text-sm text-ink">Wilt u iemand toevoegen of een rol wijzigen? Dat kan enkel {name}. U kan het wel voorstellen.</p>
        <Button size="sm" variant="soft" onClick={() => setSuggest(true)}>
          <UserPlus className="size-4" aria-hidden /> Stel iemand voor
        </Button>
      </Card>

      <SectionTitle>De drie rollen</SectionTitle>
      <div className="space-y-2.5">
        {(["meldingen", "inzage", "handelen"] as RoleId[]).map((r) => (
          <Card key={r}>
            <RoleExplainer role={r} limit={limit} />
          </Card>
        ))}
      </div>

      <Sheet open={suggest} onClose={() => setSuggest(false)} title={`Iemand voorstellen aan ${name}`}>
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {name} krijgt uw voorstel in {poss(elder)} eigen app en beslist zelf. Er wordt niets gedeeld tot {name} ja zegt.
          </p>
          <label className="block">
            <span className="text-sm font-semibold">Naam</span>
            <input defaultValue="Luc Peeters" className="mt-1 h-11 w-full rounded-xl px-3 ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-brand" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Relatie</span>
            <input defaultValue={`Broer van ${name}`} className="mt-1 h-11 w-full rounded-xl px-3 ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-brand" />
          </label>
          <div>
            <span className="text-sm font-semibold">Voorgestelde rol</span>
            <div className="mt-2">
              <RoleBadge role="meldingen" />
            </div>
          </div>
          <Button
            full
            loading={sending}
            onClick={async () => {
              setSending(true);
              await wait(900);
              setSending(false);
              setSuggest(false);
              toast(`Voorstel verstuurd naar ${name}.`);
            }}
          >
            <Mail className="size-4" aria-hidden /> Verstuur voorstel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
