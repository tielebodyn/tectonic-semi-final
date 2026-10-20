"use client";

import { useState } from "react";
import { Bell, Eye, HandCoins, UserX } from "lucide-react";
import { PEOPLE, firstName } from "@/lib/data";
import { actions, useDemo } from "@/lib/store";
import type { PersonId, RoleId } from "@/lib/types";
import { AuditLog } from "@/components/audit-log";
import { Avatar, Button, RoleBadge, Sheet, Toggle, cx, toast } from "@/components/ui";

const PLAIN: Record<RoleId, (name: string, limit: number) => string> = {
  meldingen: (n) => `${n} krijgt een bericht als er iets ongewoons is. ${n} ziet geen geld.`,
  inzage: (n) => `${n} mag kijken naar uw rekeningen. ${n} mag niet betalen.`,
  handelen: (n, l) => `${n} mag rekeningen betalen tot €${l}. Meer dan €${l}? Dan vragen we het eerst aan u.`,
};

const OPTIONS: { role: RoleId; title: string; icon: typeof Bell }[] = [
  { role: "meldingen", title: "Alleen een bericht krijgen", icon: Bell },
  { role: "inzage", title: "Mijn rekeningen bekijken", icon: Eye },
  { role: "handelen", title: "Rekeningen betalen voor mij", icon: HandCoins },
];

export default function ConsentCentre() {
  const s = useDemo();
  const [editing, setEditing] = useState<PersonId | null>(null);
  const limit = s.limits.maria;
  const members = s.circles.maria;
  const familyActions = s.audit.maria.filter((e) => e.actor !== "maria");
  const editingMember = members.find((m) => m.personId === editing);

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Wie helpt mij?</h1>
      <p className="mt-2 text-muted">U beslist. U kan alles altijd veranderen of stoppen.</p>

      <section className="mt-6 space-y-4">
        {members.map((m) => {
          const p = PEOPLE[m.personId];
          const revoked = m.status === "revoked";
          return (
            <div key={m.personId} className={cx("rounded-3xl p-5 ring-2 ring-inset", revoked ? "bg-canvas ring-line" : "bg-white ring-line")}>
              <div className="flex items-center gap-4">
                <Avatar id={m.personId} size="xl" />
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-bold text-ink">{p.firstName}</p>
                  <p className="text-lg text-muted">{m.relation}</p>
                </div>
              </div>
              {revoked ? (
                <>
                  <p className="mt-4 text-ink">{p.firstName} heeft geen toegang meer.</p>
                  <Button
                    full
                    size="xl"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => {
                      actions.restore("maria", m.personId);
                      toast(`${p.firstName} heeft weer toegang.`);
                    }}
                  >
                    Toegang terugzetten
                  </Button>
                </>
              ) : (
                <>
                  <div className="mt-4">
                    <RoleBadge role={m.role} size="lg" />
                  </div>
                  <p className="mt-3 text-ink">{PLAIN[m.role](p.firstName, limit)}</p>
                  {m.status === "invited" && <p className="mt-2 text-lg text-attention">Uitgenodigd, nog niet aangesloten.</p>}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button size="xl" variant="secondary" className="!text-lg" onClick={() => setEditing(m.personId)}>
                      Aanpassen
                    </Button>
                    <Button
                      size="xl"
                      variant="secondary"
                      className="!text-lg text-[#b23a3a]"
                      onClick={() => {
                        actions.revoke("maria", m.personId);
                        toast(`${p.firstName} heeft geen toegang meer.`, { label: "Ongedaan maken", onClick: () => actions.restore("maria", m.personId) });
                      }}
                    >
                      <UserX className="size-5" aria-hidden /> Stoppen
                    </Button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </section>

      <h2 className="mt-10 text-2xl font-bold text-ink">Mijn regels</h2>
      <section className="mt-4 space-y-4">
        {s.rules.maria.map((r) => (
          <div key={r.id} className="flex items-start gap-4 rounded-3xl bg-canvas p-5">
            <p className="flex-1 text-ink">
              <strong>{r.condition}</strong>, verwittig {r.notify.map(firstName).join(" en ")}.
            </p>
            <Toggle
              large
              checked={r.active}
              label={r.condition}
              onChange={() => {
                actions.toggleRule("maria", r.id);
                toast(r.active ? "Regel staat uit." : "Regel staat aan.");
              }}
            />
          </div>
        ))}
        <div className="rounded-3xl bg-canvas p-5 text-ink">
          Betalingen boven <strong>€{limit}</strong> vragen altijd eerst uw goedkeuring.
        </div>
      </section>

      <h2 id="logboek" className="mt-10 scroll-mt-4 text-2xl font-bold text-ink">
        Wat deden ze?
      </h2>
      <div className="mt-3 rounded-3xl ring-2 ring-inset ring-line">
        <AuditLog entries={familyActions} large limit={6} />
      </div>

      <Sheet open={!!editingMember} onClose={() => setEditing(null)} title={editingMember ? `Wat mag ${PEOPLE[editingMember.personId].firstName} doen?` : ""} large>
        {editingMember && (
          <div className="space-y-3">
            {OPTIONS.map((o) => {
              const Icon = o.icon;
              const active = editingMember.role === o.role;
              return (
                <button
                  key={o.role}
                  type="button"
                  onClick={() => {
                    if (!active) actions.setRole("maria", editingMember.personId, o.role);
                    setEditing(null);
                    toast(`${PEOPLE[editingMember.personId].firstName}: ${o.title.toLowerCase()}.`);
                  }}
                  className={cx("flex w-full items-center gap-4 rounded-3xl p-5 text-left ring-2 ring-inset", active ? "bg-brand-mist ring-brand" : "ring-line")}
                >
                  <Icon className="size-8 shrink-0 text-navy" aria-hidden />
                  <span className="text-xl font-bold text-ink">{o.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </Sheet>
    </div>
  );
}
