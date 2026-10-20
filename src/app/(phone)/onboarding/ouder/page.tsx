"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Check, Eye, Fingerprint, HandCoins, HeartHandshake, KeyRound, UserPlus } from "lucide-react";
import { PEOPLE, firstName } from "@/lib/data";
import { euro0 } from "@/lib/format";
import { FRAUD_RULE, actions, useDemo } from "@/lib/store";
import type { PersonId, RoleId, Rule } from "@/lib/types";
import { Avatar, Button, RoleBadge, Spinner, SuccessMark, Toggle, cx, toast, wait } from "@/components/ui";
import { useScene } from "@/lib/tour";
import { Logo } from "@/components/logo";

const CANDIDATES: { id: PersonId; relation: string }[] = [
  { id: "sarah", relation: "Daughter" },
  { id: "tom", relation: "Son" },
  { id: "ann", relation: "Neighbour" },
];

const ROLE_OPTIONS: { role: RoleId; title: string; text: (n: string) => string; icon: typeof Bell }[] = [
  { role: "meldingen", title: "Just get an alert", text: (n) => `${n} gets an alert if something unusual happens, but can't see any money.`, icon: Bell },
  { role: "inzage", title: "See my accounts", text: (n) => `${n} can see your accounts, but can't pay.`, icon: Eye },
  { role: "handelen", title: "Pay bills for me", text: (n) => `${n} can pay bills, up to an amount you choose.`, icon: HandCoins },
];

const LIMITS = [250, 500, 1000];
const UNPAID_RULE = "If a bill is still unpaid after 2 months";
const HOSPITAL_RULE = "If I'm admitted to hospital";
const names = (ids: PersonId[]) => ids.map(firstName).join(", ").replace(/, ([^,]*)$/, " and $1");

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
  const [screenLocal, setScreen] = useState<Screen>({ kind: "intro" });
  const [history, setHistory] = useState<Screen[]>([]);
  const [selectedLocal, setSelected] = useState<PersonId[]>(invitedBy ? [invitedBy] : []);
  const [rolesLocal, setRoles] = useState<Partial<Record<PersonId, RoleId>>>({});
  const [limitsLocal, setLimits] = useState<Partial<Record<PersonId, number>>>({});
  // A guided demo step decides what this flow shows.
  const scene = useScene();
  const screen = (scene?.["ouder.screen"] as Screen | undefined) ?? screenLocal;
  const selected = (scene?.["ouder.selected"] as PersonId[] | undefined) ?? selectedLocal;
  const roles = (scene?.["ouder.roles"] as Partial<Record<PersonId, RoleId>> | undefined) ?? rolesLocal;
  const sceneLimit = scene?.["ouder.limit"] as number | undefined;
  const limitFor = (id: PersonId) => sceneLimit ?? limitsLocal[id] ?? 500;
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
    if (ruleOn.fraud) out.push({ condition: FRAUD_RULE, notify: fraudNotify, active: true });
    if (ruleOn.unpaid) out.push({ condition: UNPAID_RULE, notify: unpaidNotify, active: true });
    if (ruleOn.hospital) out.push({ condition: HOSPITAL_RULE, notify: people.map((p) => p.id), active: true });
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
            <ArrowLeft className="size-7" aria-hidden /> Back
          </button>
        ) : (
          <Logo size="md" />
        )}
      </header>

      <main className="flex flex-1 flex-col px-5 pb-10 pt-2 text-xl leading-relaxed">
        {screen.kind === "intro" && (
          <>
            {invitedBy ? (
              <>
                <Avatar id={invitedBy} size="xl" />
                <h1 className="mt-5 text-3xl font-bold leading-tight">{firstName(invitedBy)} would like to help you</h1>
                <p className="mt-4 text-ink">
                  {firstName(invitedBy)} started KBC Mantel and invited you. Nothing about you has been shared yet. You choose who may do what.
                </p>
              </>
            ) : (
              <>
                <HeartHandshake className="size-14 text-brand" aria-hidden />
                <h1 className="mt-5 text-3xl font-bold leading-tight">Who would you trust to help you, if you ever need it?</h1>
                <p className="mt-4 text-ink">You choose who, and what they may do. You can change it at any time.</p>
              </>
            )}
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => go({ kind: "people" })}>
                Choose someone
              </Button>
            </div>
          </>
        )}

        {screen.kind === "people" && (
          <>
            <h1 className="text-3xl font-bold">Who would you like to choose?</h1>
            <p className="mt-2 text-muted">You can choose more than one. Tap Continue when you’re done.</p>
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
                onClick={() => toast("In this demo, you choose from Sarah, Tom and Ann.")}
                className="flex w-full items-center gap-4 rounded-3xl p-4 text-left text-xl font-semibold text-navy border-2 border-dashed border-line"
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-canvas">
                  <UserPlus className="size-7" aria-hidden />
                </span>
                Someone else
              </button>
            </div>
            <div className="mt-auto pt-8">
              <Button size="xl" full disabled={selected.length === 0} onClick={() => go({ kind: "role", i: 0 })}>
                {selected.length === 0 ? "Choose at least one person" : `Continue with ${names(CANDIDATES.filter((c) => selected.includes(c.id)).map((c) => c.id))}`}
              </Button>
            </div>
          </>
        )}

        {screen.kind === "role" && people[screen.i] && (
          <RoleScreen
            key={people[screen.i].id}
            id={people[screen.i].id}
            step={screen.i}
            people={people.map((p) => p.id)}
            roles={roles}
            current={roles[people[screen.i].id]}
            onPick={(role) => {
              const id = people[screen.i].id;
              setRoles((r) => ({ ...r, [id]: role }));
              afterRole(screen.i, role);
            }}
          />
        )}

        {screen.kind === "limit" && people[screen.i] && (
          <LimitScreen
            key={people[screen.i].id}
            id={people[screen.i].id}
            step={screen.i}
            people={people.map((p) => p.id)}
            roles={roles}
            initial={limitFor(people[screen.i].id)}
            onPick={(l) => {
              const id = people[screen.i].id;
              setLimits((m) => ({ ...m, [id]: l }));
              if (screen.i + 1 < people.length) go({ kind: "role", i: screen.i + 1 });
              else go({ kind: "rules" });
            }}
          />
        )}

        {screen.kind === "rules" && (
          <>
            <h1 className="text-3xl font-bold leading-tight">When should we let someone know?</h1>
            <div className="mt-6 space-y-3">
              <RuleRow
                on={ruleOn.fraud}
                onChange={(v) => setRuleOn((r) => ({ ...r, fraud: v }))}
                text={`${FRAUD_RULE}, let ${names(fraudNotify)} know.`}
                hint="Recommended"
              />
              <RuleRow
                on={ruleOn.unpaid}
                onChange={(v) => setRuleOn((r) => ({ ...r, unpaid: v }))}
                text={`${UNPAID_RULE}, let ${names(unpaidNotify)} know.`}
              />
              <RuleRow
                on={ruleOn.hospital}
                onChange={(v) => setRuleOn((r) => ({ ...r, hospital: v }))}
                text={`${HOSPITAL_RULE}, let ${names(people.map((p) => p.id))} know.`}
              />
            </div>
            <div className="mt-auto pt-8">
              <Button size="xl" full onClick={() => go({ kind: "summary" })}>
                Continue
              </Button>
            </div>
          </>
        )}

        {screen.kind === "summary" && (
          <>
            <h1 className="text-3xl font-bold">Is this right?</h1>
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
                      {role === "handelen" ? `Can pay bills up to ${euro0(limitFor(p.id))} without asking you.` : ROLE_OPTIONS.find((o) => o.role === role)!.text(firstName(p.id))}
                    </p>
                  </div>
                );
              })}
              {buildRules().map((r) => (
                <p key={r.condition} className="rounded-3xl bg-brand-mist p-5 text-ink">
                  <strong>{r.condition}</strong>, let {names(r.notify)} know.
                </p>
              ))}
            </div>
            <p className="mt-6 flex items-start gap-3 text-ink">
              <KeyRound className="mt-1 size-6 shrink-0 text-navy" aria-hidden /> You can change or stop this at any time.
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
                    people.map((p) => ({
                      personId: p.id,
                      relation: p.relation,
                      role: roles[p.id] ?? "meldingen",
                      ...(roles[p.id] === "handelen" && { limit: limitFor(p.id) }),
                    })),
                    buildRules(),
                    actors.length ? Math.max(...actors.map(limitFor)) : 500,
                  );
                  setScreen({ kind: "done" });
                }}
              >
                Yes, that’s right
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
            <p className="mt-6 text-2xl font-bold">Confirm with your fingerprint</p>
            <p className="mt-2 text-muted">Just like you do in KBC Mobile.</p>
          </div>
        )}

        {screen.kind === "done" && (
          <div className="flex flex-1 flex-col text-center">
            <div className="pt-6">
              <SuccessMark large />
              <h1 className="mt-6 text-3xl font-bold">Thank you, Maria</h1>
              <p className="mt-4 text-ink">
                {names(people.map((p) => p.id))} {people.length === 1 ? "gets" : "get"} an invitation now.
              </p>
              <p className="mt-3 text-ink">You can see and change who helps you in My Mantel.</p>
            </div>
            <div className="mt-auto space-y-3 pt-8">
              <Button size="xl" full onClick={() => router.push("/maria")}>
                Go to My Mantel
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/** Shows whose turn it is when several people are chosen, and what was already decided for the others. */
function PeopleProgress({ step, people, roles }: { step: number; people: PersonId[]; roles: Partial<Record<PersonId, RoleId>> }) {
  if (people.length < 2) return null;
  return (
    <div className="mb-5">
      <p className="text-lg font-semibold text-muted">
        Person {step + 1} of {people.length}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {people.map((id, i) => (
          <span
            key={id}
            className={cx(
              "flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-base font-semibold ring-2 ring-inset",
              i === step ? "bg-brand-mist ring-brand text-ink" : i < step ? "ring-line text-ink" : "ring-line text-faint",
            )}
          >
            <Avatar id={id} size="sm" />
            {firstName(id)}
            {i < step && roles[id] && <Check className="size-4 text-calm" strokeWidth={3} aria-label="done" />}
          </span>
        ))}
      </div>
    </div>
  );
}

function RoleScreen({
  id,
  step,
  people,
  roles,
  current,
  onPick,
}: {
  id: PersonId;
  step: number;
  people: PersonId[];
  roles: Partial<Record<PersonId, RoleId>>;
  current?: RoleId;
  onPick: (r: RoleId) => void;
}) {
  const name = firstName(id);
  const [picked, setPicked] = useState<RoleId | undefined>(current);
  const next = people[step + 1];
  return (
    <>
      <PeopleProgress step={step} people={people} roles={roles} />
      <div className="flex items-center gap-3">
        <Avatar id={id} size="xl" />
      </div>
      <h1 className="mt-4 text-3xl font-bold">What may {name} do?</h1>
      <div className="mt-6 space-y-3">
        {ROLE_OPTIONS.map((o) => {
          const Icon = o.icon;
          const on = picked === o.role;
          return (
            <button
              key={o.role}
              type="button"
              onClick={() => setPicked(o.role)}
              aria-pressed={on}
              className={cx("flex w-full items-start gap-4 rounded-3xl p-5 text-left ring-2 ring-inset transition-colors", on ? "bg-brand-mist ring-brand" : "ring-line hover:bg-canvas")}
            >
              <Icon className="mt-1 size-8 shrink-0 text-navy" aria-hidden />
              <span className="flex-1">
                <span className="block text-2xl font-bold leading-snug text-ink">{o.title}</span>
                <span className="mt-1 block text-lg text-muted">{o.text(name)}</span>
              </span>
              <span className={cx("mt-1 flex size-8 shrink-0 items-center justify-center rounded-full ring-2 ring-inset", on ? "bg-navy text-white ring-navy" : "ring-line")}>
                {on && <Check className="size-5" strokeWidth={3} aria-hidden />}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-auto pt-8">
        <Button size="xl" full disabled={!picked} onClick={() => picked && onPick(picked)}>
          {!picked ? `Choose what ${name} may do` : picked === "handelen" ? "Next: choose an amount" : next ? `Next: ${firstName(next)}` : "Continue"}
        </Button>
      </div>
    </>
  );
}

function LimitScreen({
  id,
  step,
  people,
  roles,
  initial,
  onPick,
}: {
  id: PersonId;
  step: number;
  people: PersonId[];
  roles: Partial<Record<PersonId, RoleId>>;
  initial: number;
  onPick: (limit: number) => void;
}) {
  const name = firstName(id);
  const [limit, setLimit] = useState(initial);
  const [custom, setCustom] = useState(LIMITS.includes(initial) ? "" : String(initial));
  const customOn = custom !== "";
  const next = people[step + 1];
  return (
    <>
      <PeopleProgress step={step} people={people} roles={roles} />
      <h1 className="text-3xl font-bold leading-tight">How much may {name} pay without asking you?</h1>
      <div className="mt-6 space-y-3">
        {LIMITS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              setLimit(l);
              setCustom("");
            }}
            aria-pressed={!customOn && limit === l}
            className={cx("flex w-full items-center justify-between rounded-3xl p-5 text-left ring-2 ring-inset", !customOn && limit === l ? "bg-brand-mist ring-brand" : "ring-line")}
          >
            <span className="text-3xl font-bold text-ink">{euro0(l)}</span>
            {l === 500 && <span className="text-lg font-semibold text-muted">Most popular</span>}
          </button>
        ))}
        <label className={cx("flex w-full items-center gap-3 rounded-3xl p-5 ring-2 ring-inset", customOn ? "bg-brand-mist ring-brand" : "ring-line")}>
          <span className="text-xl font-semibold text-ink">Other amount</span>
          <span className="ml-auto flex items-center gap-1 text-3xl font-bold text-ink">
            €
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step={10}
              placeholder="…"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                const n = Math.round(Number(e.target.value));
                if (n > 0) setLimit(n);
              }}
              className="w-32 rounded-xl bg-white px-2 py-1 text-right outline-none ring-2 ring-inset ring-line focus:ring-brand"
              aria-label={`Other amount for ${name}`}
            />
          </span>
        </label>
      </div>
      <p className="mt-6 text-ink">Anything more, we ask you first. You get an alert for every payment.</p>
      <div className="mt-auto pt-8">
        <Button size="xl" full disabled={customOn && !(Number(custom) > 0)} onClick={() => onPick(limit)}>
          {next ? `${euro0(limit)} for ${name} · Next: ${firstName(next)}` : `${euro0(limit)} for ${name} · Continue`}
        </Button>
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
