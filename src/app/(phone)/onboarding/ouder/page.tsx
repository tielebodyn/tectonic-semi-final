"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Check, Eye, Fingerprint, HandCoins, HeartHandshake, KeyRound, UserPlus } from "lucide-react";
import { PEOPLE, firstName } from "@/lib/data";
import { euro0 } from "@/lib/format";
import { actions, useDemo } from "@/lib/store";
import type { PersonId, RoleId, Rule } from "@/lib/types";
import { Avatar, Button, RoleBadge, Spinner, SuccessMark, Toggle, cx, toast, wait } from "@/components/ui";

const CANDIDATES: { id: PersonId; relation: string }[] = [
  { id: "sarah", relation: "Dochter" },
  { id: "tom", relation: "Zoon" },
  { id: "ann", relation: "Buurvrouw" },
];

const ROLE_OPTIONS: { role: RoleId; title: string; text: (n: string) => string; icon: typeof Bell }[] = [
  { role: "meldingen", title: "Alleen een bericht krijgen", text: (n) => `${n} krijgt een bericht als er iets ongewoons is. ${n} ziet geen geld.`, icon: Bell },
  { role: "inzage", title: "Mijn rekeningen bekijken", text: (n) => `${n} mag meekijken, maar niet betalen.`, icon: Eye },
  { role: "handelen", title: "Rekeningen betalen voor mij", text: (n) => `${n} mag betalen tot een bedrag dat u kiest.`, icon: HandCoins },
];

const LIMITS = [250, 500, 1000];

type Screen =
  | { kind: "intro" }
  | { kind: "people" }
  | { kind: "role"; i: number }
  | { kind: "limit"; i: number }
  | { kind: "rules" }
  | { kind: "summary" }
  | { kind: "signing" }
  | { kind: "done" };

export default function ParentOnboardingPage() {
  const router = useRouter();
  return (
    <Fragment key={router.bfcacheId}>
      <ParentOnboarding />
    </Fragment>
  );
}

function ParentOnboarding() {
  const s = useDemo();
  const router = useRouter();
  const invitedBy = s.pendingInvite?.elder === "maria" ? s.pendingInvite.by : null;
  const [screen, setScreen] = useState<Screen>({ kind: "intro" });
  const [history, setHistory] = useState<Screen[]>([]);
  const [selected, setSelected] = useState<PersonId[]>(invitedBy ? [invitedBy] : []);
  const [roles, setRoles] = useState<Partial<Record<PersonId, RoleId>>>({});
  const [limit, setLimit] = useState(500);
  const [ruleOn, setRuleOn] = useState({ fraud: true, unpaid: false, hospital: false });

  const go = (next: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  };
  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) return router.push("/maria");
    setHistory((h) => h.slice(0, -1));
    setScreen(prev);
  };

  const people = CANDIDATES.filter((c) => selected.includes(c.id));
  const actors = people.filter((p) => roles[p.id] === "handelen").map((p) => p.id);
  const alerted = people.filter((p) => roles[p.id] === "handelen" || roles[p.id] === "meldingen").map((p) => p.id);
  const fraudNotify = alerted.length ? alerted : people.map((p) => p.id);
  const unpaidNotify = actors.length ? actors : people.slice(0, 1).map((p) => p.id);

  const buildRules = (): Omit<Rule, "id">[] => {
    const out: Omit<Rule, "id">[] = [];
    if (ruleOn.fraud) out.push({ condition: "Als er iets verdachts gebeurt op mijn rekening", notify: fraudNotify, active: true });
    if (ruleOn.unpaid) out.push({ condition: "Als een factuur 2 maanden niet betaald is", notify: unpaidNotify, active: true });
    if (ruleOn.hospital) out.push({ condition: "Als ik in het ziekenhuis word opgenomen", notify: people.map((p) => p.id), active: true });
    return out;
  };

  const afterRole = (i: number, role: RoleId) => {
    if (role === "handelen") return go({ kind: "limit", i });
    if (i + 1 < people.length) return go({ kind: "role", i: i + 1 });
    go({ kind: "rules" });
  };

  const showBack = screen.kind !== "intro" && screen.kind !== "signing" && screen.kind !== "done";

  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="flex h-16 items-center justify-between px-5 pt-2">
        {showBack ? (
          <button type="button" onClick={back} className="inline-flex items-center gap-2 py-2 pr-3 text-xl font-semibold text-navy">
            <ArrowLeft className="size-7" aria-hidden /> Terug
          </button>
        ) : (
          <span className="flex items-center gap-2.5 text-navy">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-navy text-white">
              <KeyRound className="size-5" aria-hidden />
            </span>
            <span className="text-xl font-bold">KBC Mantel</span>
          </span>
        )}
      </header>

      <main className="flex flex-1 flex-col px-5 pb-10 pt-2 text-xl leading-relaxed">
        {screen.kind === "intro" && (
          <>
            {invitedBy ? (
              <>
                <Avatar id={invitedBy} size="xl" />
                <h1 className="mt-5 text-3xl font-bold leading-tight">{firstName(invitedBy)} wil u graag helpen</h1>
                <p className="mt-4 text-ink">
                  {firstName(invitedBy)} startte KBC Mantel en nodigde u uit. Er werd nog niets over u gedeeld. U beslist zelf wie wat mag.
                </p>
              </>
            ) : (
              <>
                <HeartHandshake className="size-14 text-brand" aria-hidden />
                <h1 className="mt-5 text-3xl font-bold leading-tight">Wie zou u vertrouwen om u te helpen als dat ooit nodig is?</h1>
                <p className="mt-4 text-ink">U kiest zelf wie, en wat die persoon mag. U kan het altijd veranderen.</p>
              </>
            )}
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => go({ kind: "people" })}>
                Iemand kiezen
              </Button>
            </div>
          </>
        )}

        {screen.kind === "people" && (
          <>
            <h1 className="text-3xl font-bold">Wie kiest u?</h1>
            <p className="mt-2 text-muted">Tik op elke persoon die u vertrouwt.</p>
            <div className="mt-6 space-y-3">
              {CANDIDATES.map((c) => {
                const on = selected.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelected((sel) => (on ? sel.filter((x) => x !== c.id) : [...sel, c.id]))}
                    className={cx("flex w-full items-center gap-4 rounded-3xl p-4 text-left ring-2 ring-inset transition-colors", on ? "bg-brand-mist ring-brand" : "ring-line")}
                    aria-pressed={on}
                  >
                    <Avatar id={c.id} size="xl" />
                    <span className="flex-1">
                      <span className="block text-2xl font-bold text-ink">{PEOPLE[c.id].firstName}</span>
                      <span className="block text-lg text-muted">{c.relation}</span>
                    </span>
                    <span className={cx("flex size-10 items-center justify-center rounded-full ring-2 ring-inset", on ? "bg-navy text-white ring-navy" : "ring-line")}>
                      {on && <Check className="size-6" strokeWidth={3} aria-hidden />}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => toast("In de demo kiest u uit Sarah, Tom en Ann.")}
                className="flex w-full items-center gap-4 rounded-3xl p-4 text-left text-xl font-semibold text-navy border-2 border-dashed border-line"
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-canvas">
                  <UserPlus className="size-7" aria-hidden />
                </span>
                Iemand anders
              </button>
            </div>
            <div className="mt-auto pt-8">
              <Button size="xl" full disabled={selected.length === 0} onClick={() => go({ kind: "role", i: 0 })}>
                Verder
              </Button>
            </div>
          </>
        )}

        {screen.kind === "role" && people[screen.i] && (
          <RoleScreen
            key={people[screen.i].id}
            id={people[screen.i].id}
            current={roles[people[screen.i].id]}
            onPick={(role) => {
              const id = people[screen.i].id;
              setRoles((r) => ({ ...r, [id]: role }));
              afterRole(screen.i, role);
            }}
          />
        )}

        {screen.kind === "limit" && (
          <>
            <h1 className="text-3xl font-bold leading-tight">
              Tot hoeveel mag {firstName(people[screen.i].id)} betalen zonder het u te vragen?
            </h1>
            <div className="mt-6 space-y-3">
              {LIMITS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLimit(l);
                    if (screen.i + 1 < people.length) go({ kind: "role", i: screen.i + 1 });
                    else go({ kind: "rules" });
                  }}
                  className={cx("flex w-full items-center justify-between rounded-3xl p-5 text-left ring-2 ring-inset", limit === l ? "bg-brand-mist ring-brand" : "ring-line")}
                >
                  <span className="text-3xl font-bold text-ink">{euro0(l)}</span>
                  {l === 500 && <span className="text-lg font-semibold text-muted">meest gekozen</span>}
                </button>
              ))}
            </div>
            <p className="mt-6 text-ink">Meer dan dat? Dan vragen we het eerst aan u. Van elke betaling krijgt u een bericht.</p>
          </>
        )}

        {screen.kind === "rules" && (
          <>
            <h1 className="text-3xl font-bold leading-tight">Wanneer moeten we iemand verwittigen?</h1>
            <div className="mt-6 space-y-3">
              <RuleRow
                on={ruleOn.fraud}
                onChange={(v) => setRuleOn((r) => ({ ...r, fraud: v }))}
                text={`Als er iets verdachts gebeurt op mijn rekening, verwittig ${fraudNotify.map(firstName).join(" en ")}.`}
                hint="Aangeraden"
              />
              <RuleRow
                on={ruleOn.unpaid}
                onChange={(v) => setRuleOn((r) => ({ ...r, unpaid: v }))}
                text={`Als een factuur 2 maanden niet betaald is, verwittig ${unpaidNotify.map(firstName).join(" en ")}.`}
              />
              <RuleRow
                on={ruleOn.hospital}
                onChange={(v) => setRuleOn((r) => ({ ...r, hospital: v }))}
                text={`Als ik in het ziekenhuis word opgenomen, verwittig ${people.map((p) => firstName(p.id)).join(" en ")}.`}
              />
            </div>
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => go({ kind: "summary" })}>
                Verder
              </Button>
            </div>
          </>
        )}

        {screen.kind === "summary" && (
          <>
            <h1 className="text-3xl font-bold">Klopt dit?</h1>
            <div className="mt-6 space-y-3">
              {people.map((p) => {
                const role = roles[p.id] ?? "meldingen";
                return (
                  <div key={p.id} className="rounded-3xl bg-canvas p-5">
                    <div className="flex items-center gap-3">
                      <Avatar id={p.id} size="lg" />
                      <span className="flex-1 text-2xl font-bold text-ink">{firstName(p.id)}</span>
                      <RoleBadge role={role} size="lg" />
                    </div>
                    <p className="mt-3 text-ink">
                      {role === "handelen" ? `Mag betalen tot ${euro0(limit)}.` : ROLE_OPTIONS.find((o) => o.role === role)!.text(firstName(p.id))}
                    </p>
                  </div>
                );
              })}
              {buildRules().map((r) => (
                <p key={r.condition} className="rounded-3xl bg-brand-mist p-5 text-ink">
                  <strong>{r.condition}</strong>, verwittig {r.notify.map(firstName).join(" en ")}.
                </p>
              ))}
            </div>
            <p className="mt-6 flex items-start gap-3 text-ink">
              <KeyRound className="mt-1 size-6 shrink-0 text-navy" aria-hidden /> U kan dit altijd veranderen of stoppen, met één tik.
            </p>
            <div className="mt-auto pt-8">
              <Button
                size="xl"
                full
                onClick={async () => {
                  go({ kind: "signing" });
                  await wait(1800);
                  actions.activateMantel(
                    "maria",
                    people.map((p) => ({ personId: p.id, relation: p.relation, role: roles[p.id] ?? "meldingen" })),
                    buildRules(),
                    limit,
                  );
                  setScreen({ kind: "done" });
                }}
              >
                Ja, zo is het goed
              </Button>
            </div>
          </>
        )}

        {screen.kind === "signing" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="relative flex size-28 items-center justify-center rounded-full bg-brand-soft text-navy">
              <Fingerprint className="size-14" aria-hidden />
              <Spinner className="absolute -right-1 -top-1 size-8 text-brand" />
            </span>
            <p className="mt-6 text-2xl font-bold">Bevestig met uw vinger</p>
            <p className="mt-2 text-muted">Zoals u gewoon bent in de KBC-app.</p>
          </div>
        )}

        {screen.kind === "done" && (
          <div className="flex flex-1 flex-col text-center">
            <div className="pt-6">
              <SuccessMark large />
              <h1 className="mt-6 text-3xl font-bold">Dank u, Maria</h1>
              <p className="mt-4 text-ink">
                {people.map((p) => firstName(p.id)).join(", ").replace(/, ([^,]*)$/, " en $1")} {people.length === 1 ? "krijgt" : "krijgen"} nu een uitnodiging.
              </p>
              <p className="mt-3 text-ink">U houdt de sleutel. Altijd.</p>
            </div>
            <div className="mt-auto space-y-3 pt-8">
              <Button size="xl" full onClick={() => router.push("/maria")}>
                Naar mijn Mantel
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function RoleScreen({ id, current, onPick }: { id: PersonId; current?: RoleId; onPick: (r: RoleId) => void }) {
  const name = firstName(id);
  return (
    <>
      <div className="flex items-center gap-3">
        <Avatar id={id} size="xl" />
      </div>
      <h1 className="mt-4 text-3xl font-bold">Wat mag {name} doen?</h1>
      <div className="mt-6 space-y-3">
        {ROLE_OPTIONS.map((o) => {
          const Icon = o.icon;
          return (
            <button
              key={o.role}
              type="button"
              onClick={() => onPick(o.role)}
              className={cx("flex w-full items-start gap-4 rounded-3xl p-5 text-left ring-2 ring-inset transition-colors", current === o.role ? "bg-brand-mist ring-brand" : "ring-line hover:bg-canvas")}
            >
              <Icon className="mt-1 size-8 shrink-0 text-navy" aria-hidden />
              <span>
                <span className="block text-2xl font-bold leading-snug text-ink">{o.title}</span>
                <span className="mt-1 block text-lg text-muted">{o.text(name)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function RuleRow({ on, onChange, text, hint }: { on: boolean; onChange: (v: boolean) => void; text: string; hint?: string }) {
  return (
    <div className={cx("flex items-start gap-4 rounded-3xl p-5 ring-2 ring-inset", on ? "bg-brand-mist ring-brand/40" : "ring-line")}>
      <div className="flex-1">
        {hint && <p className="text-base font-semibold text-calm">{hint}</p>}
        <p className="text-ink">{text}</p>
      </div>
      <Toggle large checked={on} onChange={onChange} label={text} />
    </div>
  );
}
