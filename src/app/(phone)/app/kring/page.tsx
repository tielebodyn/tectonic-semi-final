"use client";

import { useState } from "react";
import { BadgeCheck, Fingerprint, KeyRound, Mail, UserPlus } from "lucide-react";
import { PEOPLE, ROLES, fullName, poss, subj } from "@/lib/data";
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
    return <p className="py-10 text-center text-sm text-muted">You&rsquo;ll see the circle as soon as {name} accepts your invitation.</p>;
  }

  const members = s.circles[elder].filter((m) => m.status !== "revoked");

  return (
    <div>
      <h1 className="px-1 text-2xl font-bold tracking-tight">{name}&rsquo;s circle</h1>
      <p className="mt-1 px-1 text-sm text-muted">The people who help {name}, and what each of them can do.</p>

      <Card className="mt-4 flex items-center gap-3 bg-brand-mist ring-brand/20">
        <Avatar id={elder} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">{fullName(elder)}</p>
          <p className="text-xs text-muted">Owner of the Mantel</p>
        </div>
        <Badge tone="navy">
          <KeyRound className="size-3" aria-hidden /> account holder
        </Badge>
      </Card>
      <p className="mt-2 px-1 text-xs text-muted">
        {name} chooses who&rsquo;s in the circle and what role they get. {name} can change a role or remove access whenever {subj(elder)} likes.
      </p>

      <SectionTitle>{members.length} trusted {members.length === 1 ? "person" : "people"}</SectionTitle>
      <div className="space-y-2.5">
        {members.map((m) => {
          const p = PEOPLE[m.personId];
          return (
            <Card key={m.personId} className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar id={m.personId} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">
                    {p.firstName} {p.lastName} {m.personId === viewer && <span className="font-medium text-muted">(you)</span>}
                  </p>
                  <p className="text-sm text-muted">{m.relation}</p>
                </div>
                <RoleBadge role={m.role} />
              </div>
              <p className="text-sm text-ink">
                {m.role === "handelen" ? `Can pay bills up to €${limit} per payment. Above that, ${name} decides.` : ROLES[m.role].short}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {m.guest ? (
                  <Badge>
                    <Fingerprint className="size-3" aria-hidden /> guest{m.status === "active" ? " via itsme" : ""}
                  </Badge>
                ) : (
                  <Badge tone="brand">
                    <BadgeCheck className="size-3" aria-hidden /> KBC customer
                  </Badge>
                )}
                {m.status === "invited" ? <Badge tone="attention">invited</Badge> : <Badge>since {longDate(m.since)}</Badge>}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4 space-y-3">
        <p className="text-sm text-ink">Want to add someone or change a role? Only {name} can do that, but you can suggest it.</p>
        <Button size="sm" variant="soft" onClick={() => setSuggest(true)}>
          <UserPlus className="size-4" aria-hidden /> Suggest someone
        </Button>
      </Card>

      <SectionTitle>The three roles</SectionTitle>
      <div className="space-y-2.5">
        {(["meldingen", "inzage", "handelen"] as RoleId[]).map((r) => (
          <Card key={r}>
            <RoleExplainer role={r} limit={limit} />
          </Card>
        ))}
      </div>

      <Sheet open={suggest} onClose={() => setSuggest(false)} title={`Suggest someone to ${name}`}>
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {name} gets your suggestion in {poss(elder)} own app and decides. Nothing is shared until {name} says yes.
          </p>
          <label className="block">
            <span className="text-sm font-semibold">Name</span>
            <input defaultValue="Luc Peeters" className="mt-1 h-11 w-full rounded-xl px-3 ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-brand" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Relationship</span>
            <input defaultValue={`${name}'s brother`} className="mt-1 h-11 w-full rounded-xl px-3 ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-brand" />
          </label>
          <div>
            <span className="text-sm font-semibold">Suggested role</span>
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
              toast(`Suggestion sent to ${name}.`);
            }}
          >
            <Mail className="size-4" aria-hidden /> Send suggestion
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
