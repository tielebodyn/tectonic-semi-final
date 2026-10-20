"use client";

import { useState } from "react";
import { Bell, Eye, HandCoins, UserX } from "lucide-react";
import { PEOPLE, firstName } from "@/lib/data";
import { actions, useDemo } from "@/lib/store";
import type { PersonId, RoleId } from "@/lib/types";
import { AuditLog } from "@/components/audit-log";
import { Avatar, Button, RoleBadge, Sheet, Toggle, cx, toast } from "@/components/ui";

const PLAIN: Record<RoleId, (name: string, limit: number) => string> = {
  meldingen: (n) => `${n} gets an alert if something unusual happens, but can't see any money.`,
  inzage: (n) => `${n} can see your accounts, but can't pay.`,
  handelen: (n, l) => `${n} can pay bills up to €${l}. Anything more, we ask you first.`,
};

const OPTIONS: { role: RoleId; title: string; done: (name: string) => string; icon: typeof Bell }[] = [
  { role: "meldingen", title: "Just get an alert", done: (n) => `${n} will now only get alerts.`, icon: Bell },
  { role: "inzage", title: "See my accounts", done: (n) => `${n} can now see your accounts.`, icon: Eye },
  { role: "handelen", title: "Pay bills for me", done: (n) => `${n} can now pay bills for you.`, icon: HandCoins },
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
      <h1 className="text-3xl font-bold text-ink">Who helps me?</h1>
      <p className="mt-2 text-muted">You can change or remove access at any time.</p>

      <section className="mt-6 space-y-4">
        {members.map((m) => {
          const p = PEOPLE[m.personId];
          const revoked = m.status === "revoked";
          return (
            <div key={m.personId} data-tour={`member-${m.personId}`} className={cx("rounded-3xl p-5 ring-2 ring-inset", revoked ? "bg-canvas ring-line" : "bg-white ring-line")}>
              <div className="flex items-center gap-4">
                <Avatar id={m.personId} size="xl" />
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-bold text-ink">{p.firstName}</p>
                  <p className="text-lg text-muted">{m.relation}</p>
                </div>
              </div>
              {revoked ? (
                <>
                  <p className="mt-4 text-ink">{p.firstName} no longer has access.</p>
                  <Button
                    full
                    size="xl"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => {
                      actions.restore("maria", m.personId);
                      toast(`${p.firstName} has access again.`);
                    }}
                  >
                    Give access again
                  </Button>
                </>
              ) : (
                <>
                  <div className="mt-4">
                    <RoleBadge role={m.role} size="lg" />
                  </div>
                  <p className="mt-3 text-ink">{PLAIN[m.role](p.firstName, limit)}</p>
                  {m.status === "invited" && <p className="mt-2 text-lg text-attention">Invited, but hasn’t joined yet.</p>}
                  <div className="mt-5 grid gap-3">
                    <Button size="xl" variant="secondary" className="!text-lg" onClick={() => setEditing(m.personId)}>
                      Change
                    </Button>
                    <Button
                      size="xl"
                      variant="secondary"
                      className="!text-lg text-[#b23a3a]"
                      onClick={() => {
                        actions.revoke("maria", m.personId);
                        toast(`${p.firstName} no longer has access.`, { label: "Undo", onClick: () => actions.restore("maria", m.personId) });
                      }}
                    >
                      <UserX className="size-5" aria-hidden /> Remove access
                    </Button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </section>

      <h2 className="mt-10 text-2xl font-bold text-ink">My rules</h2>
      <section className="mt-4 space-y-4">
        {s.rules.maria.map((r) => (
          <div key={r.id} className="flex items-start gap-4 rounded-3xl bg-canvas p-5">
            <p className="flex-1 text-ink">
              <strong>{r.condition}</strong>, let {r.notify.map(firstName).join(", ").replace(/, ([^,]*)$/, " and $1")} know.
            </p>
            <Toggle
              large
              checked={r.active}
              label={r.condition}
              onChange={() => {
                actions.toggleRule("maria", r.id);
                toast(r.active ? "Rule switched off." : "Rule switched on.");
              }}
            />
          </div>
        ))}
        <div className="rounded-3xl bg-canvas p-5 text-ink">
          Payments above <strong>€{limit}</strong> always need your approval first.
        </div>
      </section>

      <h2 id="logboek" className="mt-10 scroll-mt-4 text-2xl font-bold text-ink">
        What did they do?
      </h2>
      <div className="mt-3 rounded-3xl ring-2 ring-inset ring-line">
        <AuditLog entries={familyActions} large limit={6} />
      </div>

      <Sheet open={!!editingMember} onClose={() => setEditing(null)} title={editingMember ? `What may ${PEOPLE[editingMember.personId].firstName} do?` : ""} large>
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
                    toast(o.done(PEOPLE[editingMember.personId].firstName));
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
