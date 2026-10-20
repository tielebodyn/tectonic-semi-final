"use client";

import { useSyncExternalStore } from "react";
import { ELDERS, INITIAL_BILLS, firstName, fullName } from "./data";
import type {
  Approval,
  AuditEntry,
  Bill,
  ElderId,
  FraudState,
  MantelStatus,
  Member,
  PersonId,
  PushNotification,
  RequestedService,
  RoleId,
  Rule,
} from "./types";

// ---------------------------------------------------------------------------
// State shape

export type DemoState = {
  version: number;
  viewer: PersonId;
  activeElder: ElderId;
  mantel: Record<ElderId, MantelStatus>;
  /** Child-initiated invitation that the elder has not accepted yet */
  pendingInvite: { elder: ElderId; by: PersonId; at: string } | null;
  circles: Record<ElderId, Member[]>;
  rules: Record<ElderId, Rule[]>;
  limits: Record<ElderId, number>;
  bills: Record<ElderId, Bill[]>;
  approvals: Approval[];
  audit: Record<ElderId, AuditEntry[]>;
  requested: Record<ElderId, RequestedService[]>;
  waitlist: string[];
  dismissed: string[];
  tasksDone: string[];
  fraud: FraudState;
  /** When the suspicious transfer was held back */
  fraudAt: string | null;
  /** Maria's own answer to the "was this you?" question */
  fraudAnswer: "none" | "not-me";
  push: PushNotification | null;
  childSpace: { budget: number; checklist: string[] };
  /** The guided demo path the jury is clicking through */
  tour: { path: number; step: number; finished?: boolean } | null;
};

const STORAGE_KEY = "kbc-mantel-demo";
const VERSION = 6;

export const FRAUD_RULE = "If something suspicious happens on my account";

function initialState(): DemoState {
  return {
    version: VERSION,
    viewer: "sarah",
    activeElder: "jozef",
    mantel: { maria: "none", jozef: "active" },
    pendingInvite: null,
    circles: {
      maria: [],
      jozef: [
        { personId: "pieter", relation: "Son", role: "handelen", status: "active", since: "2026-03-02", guest: false },
        { personId: "sarah", relation: "Daughter-in-law", role: "inzage", status: "active", since: "2026-03-02", guest: false },
        { personId: "lieve", relation: "Daughter", role: "meldingen", status: "active", since: "2026-05-11", guest: true },
      ],
    },
    rules: {
      maria: [],
      jozef: [
        { id: "j-fraud", condition: FRAUD_RULE, notify: ["pieter", "lieve"], active: true },
        { id: "j-unpaid", condition: "If a bill is still unpaid after 2 months", notify: ["pieter"], active: true },
      ],
    },
    limits: { maria: ELDERS.maria.limit, jozef: ELDERS.jozef.limit },
    bills: structuredClone(INITIAL_BILLS),
    approvals: [],
    audit: {
      maria: [],
      jozef: [
        { id: "a-j3", at: "2026-10-16T09:12:00", actor: "pieter", text: "Pieter paid €236.00 to Wit-Gele Kruis for Jozef", amount: 236, kind: "payment" },
        { id: "a-j2", at: "2026-10-03T18:40:00", actor: "pieter", text: "Pieter put Jozef on the waiting list at De Kastanjelaar", kind: "request" },
        { id: "a-j1", at: "2026-05-11T14:05:00", actor: "jozef", text: "Jozef gave Lieve the Alerts role", kind: "access" },
      ],
    },
    requested: { maria: [], jozef: [] },
    waitlist: ["kastanjelaar"],
    dismissed: [],
    tasksDone: [],
    fraud: "none",
    fraudAt: null,
    fraudAnswer: "none",
    push: null,
    childSpace: { budget: 150, checklist: [] },
    tour: null,
  };
}

// ---------------------------------------------------------------------------
// External store plumbing

let state: DemoState | null = null;
const listeners = new Set<() => void>();
const SERVER_STATE = initialState();
let idCounter = 0;

function load(): DemoState {
  if (state) return state;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.version === VERSION) {
        state = parsed;
        return state;
      }
    }
  } catch {
    // Storage unavailable: fall back to a fresh demo.
  }
  state = initialState();
  return state;
}

function set(updater: (s: DemoState) => DemoState) {
  state = updater(load());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore: the demo still works in memory.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, load, () => SERVER_STATE);
}

const noopSubscribe = () => () => {};
/** True once we render on the client with the persisted demo state. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function getDemo() {
  return load();
}

// ---------------------------------------------------------------------------
// Helpers

const nowIso = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${idCounter++}`;

function log(s: DemoState, elder: ElderId, entry: Omit<AuditEntry, "id" | "at">): DemoState {
  return { ...s, audit: { ...s.audit, [elder]: [{ id: uid("a"), at: nowIso(), ...entry }, ...s.audit[elder]] } };
}

export function roleOf(s: DemoState, viewer: PersonId, elder: ElderId): RoleId | null {
  const m = s.circles[elder].find((x) => x.personId === viewer && x.status === "active");
  return m ? m.role : null;
}

export type ElderLink = { elder: ElderId; role: RoleId | null; state: "active" | "waiting" | "invited" };

/** Which Mantels this viewer belongs to, and how. */
export function eldersFor(s: DemoState, viewer: PersonId): ElderLink[] {
  const out: ElderLink[] = [];
  (Object.keys(s.circles) as ElderId[]).forEach((elder) => {
    if (s.mantel[elder] === "invited" && s.pendingInvite?.elder === elder && s.pendingInvite.by === viewer) {
      out.push({ elder, role: null, state: "waiting" });
      return;
    }
    const m = s.circles[elder].find((x) => x.personId === viewer && x.status !== "revoked");
    if (!m || s.mantel[elder] !== "active") return;
    out.push({ elder, role: m.status === "active" ? m.role : null, state: m.status === "active" ? "active" : "invited" });
  });
  // Maria first: she is the main story of the demo.
  return out.sort((a, b) => (a.elder === "maria" ? -1 : b.elder === "maria" ? 1 : 0));
}

// ---------------------------------------------------------------------------
// Actions

export const actions = {
  setViewer(viewer: PersonId, elder?: ElderId) {
    set((s) => ({ ...s, viewer, activeElder: elder ?? s.activeElder }));
  },
  setActiveElder(elder: ElderId) {
    set((s) => ({ ...s, activeElder: elder }));
  },

  // Onboarding ---------------------------------------------------------------
  startChildMantel(elder: ElderId, by: PersonId) {
    set((s) => ({
      ...s,
      mantel: { ...s.mantel, [elder]: "invited" },
      pendingInvite: { elder, by, at: nowIso() },
      activeElder: elder,
    }));
  },
  setChildBudget(budget: number) {
    set((s) => ({ ...s, childSpace: { ...s.childSpace, budget } }));
  },
  toggleChildCheck(id: string) {
    set((s) => {
      const list = s.childSpace.checklist;
      return { ...s, childSpace: { ...s.childSpace, checklist: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } };
    });
  },
  activateMantel(
    elder: ElderId,
    people: { personId: PersonId; relation: string; role: RoleId; limit?: number }[],
    rules: Omit<Rule, "id">[],
    limit: number,
  ) {
    set((s) => {
      const today = nowIso().slice(0, 10);
      const members: Member[] = people.map((p) => {
        const isCustomer = p.personId === "sarah";
        return {
          personId: p.personId,
          relation: p.relation,
          role: p.role,
          // KBC customers join at once. Tom still has to confirm with itsme.
          status: p.personId === "tom" ? "invited" : "active",
          since: today,
          guest: !isCustomer,
          ...(p.limit !== undefined && { limit: p.limit }),
        };
      });
      let next: DemoState = {
        ...s,
        mantel: { ...s.mantel, [elder]: "active" },
        pendingInvite: null,
        circles: { ...s.circles, [elder]: members },
        rules: { ...s.rules, [elder]: rules.map((r, i) => ({ ...r, id: `${elder}-rule-${i}` })) },
        limits: { ...s.limits, [elder]: limit },
        audit: { ...s.audit, [elder]: [] },
      };
      next = log(next, elder, { actor: elder, text: `${firstName(elder)} set up her Mantel`, kind: "access" });
      members.forEach((m) => {
        next = log(next, elder, {
          actor: elder,
          text: `${firstName(elder)} gave ${firstName(m.personId)} the ${roleLabel(m.role)} role`,
          kind: "access",
        });
      });
      return next;
    });
  },
  completeGuestJoin(elder: ElderId, personId: PersonId) {
    set((s) => {
      const next: DemoState = {
        ...s,
        viewer: personId,
        activeElder: elder,
        circles: {
          ...s.circles,
          [elder]: s.circles[elder].map((m) =>
            m.personId === personId ? { ...m, status: "active", guest: true, since: nowIso().slice(0, 10) } : m,
          ),
        },
      };
      return log(next, elder, {
        actor: personId,
        text: `${firstName(personId)} confirmed his identity with itsme and joined as a guest`,
        kind: "access",
      });
    });
  },

  // Circle & consent -----------------------------------------------------------
  setRole(elder: ElderId, personId: PersonId, role: RoleId) {
    set((s) => {
      const next = {
        ...s,
        circles: { ...s.circles, [elder]: s.circles[elder].map((m) => (m.personId === personId ? { ...m, role } : m)) },
      };
      return log(next, elder, { actor: elder, text: `${firstName(elder)} changed ${firstName(personId)}'s role to ${roleLabel(role)}`, kind: "access" });
    });
  },
  revoke(elder: ElderId, personId: PersonId) {
    set((s) => {
      const next: DemoState = {
        ...s,
        circles: { ...s.circles, [elder]: s.circles[elder].map((m) => (m.personId === personId ? { ...m, status: "revoked" } : m)) },
      };
      return log(next, elder, { actor: elder, text: `${firstName(elder)} removed ${firstName(personId)}'s access`, kind: "access" });
    });
  },
  restore(elder: ElderId, personId: PersonId) {
    set((s) => {
      const next: DemoState = {
        ...s,
        circles: { ...s.circles, [elder]: s.circles[elder].map((m) => (m.personId === personId ? { ...m, status: "active" } : m)) },
      };
      return log(next, elder, { actor: elder, text: `${firstName(elder)} gave ${firstName(personId)} access again`, kind: "access" });
    });
  },
  toggleRule(elder: ElderId, ruleId: string) {
    set((s) => ({
      ...s,
      rules: { ...s.rules, [elder]: s.rules[elder].map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r)) },
    }));
  },

  // Signals, tasks, services ---------------------------------------------------
  dismissSignal(id: string) {
    set((s) => ({ ...s, dismissed: [...s.dismissed, id] }));
  },
  restoreSignal(id: string) {
    set((s) => ({ ...s, dismissed: s.dismissed.filter((x) => x !== id) }));
  },
  toggleTask(id: string) {
    set((s) => ({ ...s, tasksDone: s.tasksDone.includes(id) ? s.tasksDone.filter((x) => x !== id) : [...s.tasksDone, id] }));
  },
  requestService(elder: ElderId, serviceId: string, partner: string, by: PersonId, withLoan: boolean) {
    set((s) => {
      const next: DemoState = {
        ...s,
        requested: { ...s.requested, [elder]: [...s.requested[elder], { serviceId, at: nowIso(), by, withLoan }] },
        tasksDone: serviceId === "traplift" ? [...new Set([...s.tasksDone, "t-traplift"])] : s.tasksDone,
      };
      return log(next, elder, {
        actor: by,
        text: `${firstName(by)} requested ${partner} for ${firstName(elder)}${withLoan ? ", with a KBC Renovation Loan simulation" : ""}`,
        kind: "request",
      });
    });
  },
  addToWaitlist(elder: ElderId, homeId: string, homeName: string, by: PersonId) {
    set((s) => log({ ...s, waitlist: [...new Set([...s.waitlist, homeId])] }, elder, { actor: by, text: `${firstName(by)} asked ${homeName} for a visit`, kind: "request" }));
  },

  // Payments ---------------------------------------------------------------------
  payBill(elder: ElderId, billId: string, by: PersonId) {
    set((s) => {
      const bill = s.bills[elder].find((b) => b.id === billId)!;
      const next: DemoState = {
        ...s,
        bills: { ...s.bills, [elder]: s.bills[elder].map((b) => (b.id === billId ? { ...b, status: "paid" } : b)) },
        tasksDone: billId === "wgk-okt" ? [...new Set([...s.tasksDone, "t-bill"])] : s.tasksDone,
      };
      return log(next, elder, {
        actor: by,
        text: `${firstName(by)} paid ${bill.payee} for ${firstName(elder)}`,
        amount: bill.amount,
        kind: "payment",
      });
    });
  },
  requestApproval(elder: ElderId, billId: string, by: PersonId) {
    set((s) => {
      const bill = s.bills[elder].find((b) => b.id === billId)!;
      const next: DemoState = {
        ...s,
        bills: { ...s.bills, [elder]: s.bills[elder].map((b) => (b.id === billId ? { ...b, status: "awaiting-approval" } : b)) },
        approvals: [...s.approvals.filter((a) => a.billId !== billId), { id: uid("ap"), elder, billId, requestedBy: by, status: "pending" }],
        push: {
          id: uid("p"),
          title: `${firstName(by)} has a question`,
          body: `May ${firstName(by)} pay ${bill.payee}? Tap to answer.`,
          href: "/maria/goedkeuren",
          for: elder,
        },
      };
      return log(next, elder, {
        actor: by,
        text: `${firstName(by)} asked ${firstName(elder)} to approve a payment to ${bill.payee}`,
        amount: bill.amount,
        kind: "approval",
      });
    });
  },
  decideApproval(approvalId: string, approve: boolean) {
    set((s) => {
      const ap = s.approvals.find((a) => a.id === approvalId)!;
      const bill = s.bills[ap.elder].find((b) => b.id === ap.billId)!;
      const next: DemoState = {
        ...s,
        approvals: s.approvals.map((a) => (a.id === approvalId ? { ...a, status: approve ? "approved" : "declined" } : a)),
        bills: {
          ...s.bills,
          [ap.elder]: s.bills[ap.elder].map((b) => (b.id === ap.billId ? { ...b, status: approve ? "paid" : "declined" } : b)),
        },
      };
      return log(next, ap.elder, {
        actor: ap.elder,
        text: approve
          ? `${firstName(ap.elder)} approved the payment to ${bill.payee}. Paid by ${firstName(ap.requestedBy)}.`
          : `${firstName(ap.elder)} declined the payment to ${bill.payee}`,
        amount: bill.amount,
        kind: approve ? "payment" : "approval",
      });
    });
  },

  // Fraud ------------------------------------------------------------------------
  triggerFraud() {
    set((s) => {
      const recipients = s.rules.maria.find((r) => r.condition === FRAUD_RULE)?.notify ?? ["sarah", "ann"];
      const names = recipients.map(firstName).join(" and ");
      const next: DemoState = { ...s, fraud: "alert", fraudAt: nowIso(), fraudAnswer: "none" };
      return log(next, "maria", {
        actor: "kbc",
        text: `KBC put an unusual transfer on hold and alerted ${names}, as set in Maria's rule`,
        amount: FRAUD_TX.amount,
        kind: "alert",
      });
    });
  },
  setFraud(fraud: FraudState) {
    set((s) => {
      let next: DemoState = { ...s, fraud };
      if (fraud === "resolved") {
        next = log(next, "maria", {
          actor: s.viewer,
          text: `${firstName(s.viewer)} blocked the suspicious transfer together with KBC. The money stayed in Maria's account.`,
          amount: FRAUD_TX.amount,
          kind: "alert",
        });
      }
      return next;
    });
  },
  answerFraud() {
    set((s) => ({ ...s, fraudAnswer: "not-me" }));
  },

  // Notifications ----------------------------------------------------------------
  push(n: Omit<PushNotification, "id">) {
    set((s) => ({ ...s, push: { ...n, id: uid("p") } }));
  },
  clearPush() {
    set((s) => ({ ...s, push: null }));
  },

  // Demo control -----------------------------------------------------------------
  setTour(tour: DemoState["tour"]) {
    set((s) => ({ ...s, tour }));
  },
  /** Free browsing: Maria's Mantel is set up, no script. */
  startFree(viewer: PersonId) {
    actions.prepareStep(4);
    set((s) => ({ ...s, tour: null, viewer, activeElder: "maria" }));
  },
  /** Make sure Maria's Mantel exists with the standard circle (for skipped steps). */
  ensureMariaMantel() {
    const s = load();
    // Also reset when the jury left Tom out: the later steps of path 1 need him.
    if (s.mantel.maria !== "active" || !s.circles.maria.some((m) => m.personId === "tom")) {
      actions.activateMantel("maria", MARIA_DEFAULT_PEOPLE, MARIA_DEFAULT_RULES, ELDERS.maria.limit);
    }
  },
  reset() {
    set(() => initialState());
  },
  /** Bring the demo into the state that a given script step expects. */
  prepareStep(step: number) {
    const base = initialState();
    if (step <= 2) {
      set(() => ({ ...base, viewer: "maria", activeElder: "maria" }));
      return;
    }
    // Steps 3+: Maria already set up her Mantel.
    set(() => base);
    actions.activateMantel("maria", MARIA_DEFAULT_PEOPLE, MARIA_DEFAULT_RULES, ELDERS.maria.limit);
    if (step === 3) {
      set((s) => ({ ...s, viewer: "tom", activeElder: "maria" }));
      return;
    }
    actions.completeGuestJoin("maria", "tom");
    set((s) => ({ ...s, viewer: "sarah", activeElder: "maria" }));
  },
};

export const MARIA_DEFAULT_PEOPLE: { personId: PersonId; relation: string; role: RoleId }[] = [
  { personId: "sarah", relation: "Daughter", role: "handelen" },
  { personId: "tom", relation: "Son", role: "inzage" },
  { personId: "ann", relation: "Neighbour", role: "meldingen" },
];

export const MARIA_DEFAULT_RULES: Omit<Rule, "id">[] = [
  { condition: FRAUD_RULE, notify: ["sarah", "ann"], active: true },
];

export const FRAUD_TX = {
  amount: 2450,
  iban: "LT72 3250 0912 8841 0077",
  name: "Parcel Delivery Service",
  channel: "KBC Mobile, on a new device",
  avg: 85,
};

export function roleLabel(role: RoleId) {
  return role === "meldingen" ? "Alerts" : role === "inzage" ? "View" : "Pay";
}

export { fullName };
