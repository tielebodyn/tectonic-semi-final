"use client";

import { euro0 } from "./format";
import { actions, FRAUD_TX, getDemo, type DemoState } from "./store";
import type { PersonId } from "./types";

export type TourStep = {
  title: string;
  /** What the jury should tap on this screen */
  hint: string;
  /** The point this step proves, in one line */
  why: string;
  href: string;
  /** Puts the demo in the state this step needs, so skipping ahead always works */
  setup?: () => void;
  done?: (s: DemoState, pathname: string) => boolean;
};

export type Tour = {
  id: number;
  title: string;
  subtitle: string;
  people: PersonId[];
  prepare: () => void;
  steps: TourStep[];
};

function ensureFraud() {
  if (getDemo().fraud === "none") actions.triggerFraud();
}

export const TOURS: Tour[] = [
  {
    id: 1,
    title: "Maria chooses who helps",
    subtitle: "KBC notices changes in Maria's payments and asks her if she'd like help. She chooses who can help, and what they can do.",
    people: ["maria", "sarah", "tom"],
    prepare: () => actions.prepareStep(1),
    steps: [
      {
        title: "KBC asks Maria first",
        hint: "KBC sees changes in Maria's payments. Read the message, tap “Why am I seeing this?” and continue until you reach “Choose someone”.",
        why: "KBC asks Maria herself. Her children only see something once she agrees.",
        href: "/onboarding/signaal",
        setup: () => actions.setViewer("maria", "maria"),
        done: (_, path) => path === "/onboarding/ouder",
      },
      {
        title: "Choosing roles",
        hint: "Tap Sarah, Tom and Ann, then Continue. Sarah gets “Pay bills for me” (keep €500), Tom “See my accounts”, Ann “Just get an alert”. Leave the fraud rule on and tap “Yes, that's right”.",
        why: "Maria sets this up herself, in large text, in about a minute.",
        href: "/onboarding/ouder",
        setup: () => actions.setViewer("maria", "maria"),
        done: (s) => s.mantel.maria === "active",
      },
      {
        title: "Tom joins as a guest",
        hint: "Tom isn't a KBC customer. Tap the link in his text message, continue with itsme and have a look at Maria's Mantel.",
        why: "No KBC account needed. Family members who bank elsewhere can still help, and get to know KBC.",
        href: "/gast",
        setup: () => {
          actions.ensureMariaMantel();
          actions.setViewer("tom", "maria");
        },
        done: (s) => s.circles.maria.some((m) => m.personId === "tom" && m.status === "active"),
      },
      {
        title: "Maria can stop any time",
        hint: "Maria sees who can do what, in large text. Tap “Remove access” under Tom: his access is gone straight away. You can undo it afterwards.",
        why: "Maria can change or stop access at any time, not just when she signs up.",
        href: "/maria/toestemming",
        setup: () => {
          actions.ensureMariaMantel();
          actions.setViewer("maria", "maria");
        },
        done: (s) => s.audit.maria.some((e) => e.text.includes("removed")),
      },
    ],
  },
  {
    id: 2,
    title: "Sarah helps two parents",
    subtitle: "Sarah helps her mum and her father-in-law. She sees what's going on, arranges help and pays bills within Maria's limit.",
    people: ["sarah", "maria", "jozef"],
    prepare: () => actions.prepareStep(4),
    steps: [
      {
        title: "Two parents, two roles",
        hint: "Tap Maria's name at the top and switch to Jozef. For Jozef, Sarah only has View: she can look, but not pay.",
        why: "Sarah can have a different role for each parent, because each parent sets it.",
        href: "/app",
        setup: () => actions.setViewer("sarah", "maria"),
        done: (s) => s.activeElder === "jozef",
      },
      {
        title: "Maria's finances",
        hint: "Switch back to Maria and tap Finances at the bottom: her house, accounts, insurance and what care costs her each month.",
        why: "Maria's accounts, home, insurance and care costs in one overview.",
        href: "/app",
        setup: () => actions.setViewer("sarah", "jozef"),
        done: (s, path) => s.activeElder === "maria" && path === "/app/vermogen",
      },
      {
        title: "Arrange help",
        hint: "Services are suggested based on Maria's situation. Request Wit-Gele Kruis, then a stair lift quote with a KBC Renovation Loan.",
        why: "Each request goes to a partner with Maria's consent. The stair lift can be financed with a KBC loan.",
        href: "/app/diensten",
        setup: () => actions.setViewer("sarah", "maria"),
        done: (s) => ["wgk", "traplift"].every((id) => s.requested.maria.some((r) => r.serviceId === id)),
      },
      {
        title: "Pay for Maria",
        hint: "Tap the Wit-Gele Kruis bill of €184.20 and pay it. It's within Maria's €500 limit, and she gets a notification.",
        why: "Sarah signs as herself, not as Maria. Every payment is logged with her name.",
        href: "/app/betalen",
        setup: () => actions.setViewer("sarah", "maria"),
        done: (s) => s.bills.maria.some((b) => b.id === "wgk-okt" && b.status === "paid"),
      },
      {
        title: "Above the limit",
        hint: "Now pay the boiler repair of €742 (tap “Pay another bill” first). That's more than Maria allowed, so Sarah has to ask her first.",
        why: "Small bills can be paid straight away. Larger amounts need Maria's approval.",
        href: "/app/betalen",
        setup: () => actions.setViewer("sarah", "maria"),
        done: (s) => s.approvals.some((a) => a.billId === "ketel"),
      },
      {
        title: "Maria decides",
        hint: "Maria gets the question in her own app, in large text. Approve the payment.",
        why: "Maria approves or declines in her own app. Sarah sees her answer straight away.",
        href: "/maria/goedkeuren",
        setup: () => {
          const s = getDemo();
          if (!s.approvals.some((a) => a.billId === "ketel")) actions.requestApproval("maria", "ketel", "sarah");
          actions.setViewer("maria", "maria");
        },
        done: (s) => s.approvals.some((a) => a.billId === "ketel" && a.status !== "pending"),
      },
    ],
  },
  {
    id: 3,
    title: "Stopping a fraud attempt",
    subtitle: "Someone tries to take money from Maria's account. The rule she set alerts Sarah and Ann. Afterwards, see what KBC Mantel brings KBC.",
    people: ["sarah", "ann", "maria"],
    prepare: () => actions.prepareStep(4),
    steps: [
      {
        title: "An alert comes in",
        hint: "In a moment, an alert appears on Sarah's phone, because of the rule Maria chose. Tap the alert.",
        why: "KBC already stops suspicious transfers. With KBC Mantel, the people Maria chose are alerted too.",
        href: "/app",
        setup: () => {
          actions.setViewer("sarah", "maria");
          setTimeout(() => {
            if (getDemo().fraud !== "none") return;
            actions.triggerFraud();
            actions.push({
              title: "Alert from Maria's rule",
              body: `Unusual transfer of ${euro0(FRAUD_TX.amount)} put on hold. See what happened.`,
              href: "/app/fraude",
              tone: "alert",
              for: "sarah",
            });
          }, 1500);
        },
        done: (_, path) => path === "/app/fraude",
      },
      {
        title: "Why KBC stopped it",
        hint: "See why the transfer looks unusual, and who was alerted. Tom wasn't: that's how Maria set it up.",
        why: "Each alert says in plain language why KBC stopped the transfer.",
        href: "/app/fraude",
        setup: () => {
          ensureFraud();
          actions.setViewer("sarah", "maria");
        },
      },
      {
        title: "How Ann sees it",
        hint: "Ann, the neighbour, only has the Alerts role. She's asked to pop round, but sees no amounts or accounts.",
        why: "Ann can help Maria without seeing her money.",
        href: "/app",
        setup: () => {
          ensureFraud();
          actions.setViewer("ann", "maria");
        },
      },
      {
        title: "Blocking the transfer",
        hint: "Back to Sarah: tap “Call Mum”, then block the transfer with KBC.",
        why: "Sarah checks with Maria, KBC blocks the transfer, and the money stays in Maria's account.",
        href: "/app/fraude",
        setup: () => {
          ensureFraud();
          actions.setViewer("sarah", "maria");
        },
        done: (s) => s.fraud === "resolved",
      },
      {
        title: "What it brings KBC",
        hint: "What does KBC Mantel bring the family, KBC and its partners? Have a look at the Scale tab too.",
        why: "More loans and insurance, new customers through guests like Tom, and less fraud.",
        href: "/kbc",
      },
    ],
  },
];

export const tourById = (id: number) => TOURS.find((t) => t.id === id)!;

type Router = { push: (href: string) => void };

export function startTour(id: number, router: Router) {
  const tour = tourById(id);
  tour.prepare();
  goToStep(id, 0, router, "");
}

export function goToStep(id: number, step: number, router: Router, pathname: string) {
  const s = tourById(id).steps[step];
  s.setup?.();
  actions.setTour({ path: id, step });
  if (s.href !== pathname) router.push(s.href);
}
