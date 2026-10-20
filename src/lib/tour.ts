"use client";

import { euro0 } from "./format";
import { actions, FRAUD_TX, getDemo, MARIA_DEFAULT_PEOPLE, MARIA_DEFAULT_RULES, useDemo } from "./store";
import { ELDERS } from "./data";
import type { ElderId, PersonId } from "./types";

/**
 * A scripted demo: every step is a fixed scene. Moving to step n rebuilds the demo
 * from the path's starting point and replays the effects of steps 0..n, so Next and
 * Previous always land on exactly the same screen.
 */
export type TourStep = {
  title: string;
  /** What happens on screen, in one or two sentences */
  caption: string;
  /** The point this step proves */
  why: string;
  href: string;
  /** Who is looking, and at whose Mantel */
  as: [PersonId, ElderId];
  /** Changes the demo data. Replayed for every later step too. */
  effect?: () => void;
  /** Runs only when this step is shown (notifications and the like) */
  enter?: () => void;
  /** UI state of the screen: which sub-screen, sheet or choice is shown */
  ui?: Record<string, unknown>;
  /** data-tour id of the element to scroll to and highlight */
  focus?: string;
};

export type Tour = {
  id: number;
  title: string;
  subtitle: string;
  people: PersonId[];
  prepare: () => void;
  steps: TourStep[];
};

const ALL_ROLES = { sarah: "handelen", tom: "inzage", ann: "meldingen" } as const;
const PEOPLE3 = ["sarah", "tom", "ann"];

export const TOURS: Tour[] = [
  {
    id: 1,
    title: "Maria chooses her caregivers",
    subtitle: "KBC notices changes in Maria's payments and asks her if she'd like help. She chooses who can help, and what they can do.",
    people: ["maria", "sarah", "tom"],
    prepare: () => actions.prepareStep(1),
    steps: [
      {
        title: "A message for Maria",
        caption: "Maria opens her KBC app. KBC has a calm message for her: it noticed a few changes and would like to ask her something.",
        why: "KBC asks Maria herself. Her children only see something once she agrees.",
        href: "/onboarding/signaal",
        as: ["maria", "maria"],
        ui: { "signal.step": "message" },
      },
      {
        title: "Why am I seeing this?",
        caption: "In plain language, KBC explains what it noticed: new payments for home nursing and the pharmacy, and fewer supermarket visits.",
        why: "Every suggestion explains itself. Only Maria sees this message.",
        href: "/onboarding/signaal",
        as: ["maria", "maria"],
        ui: { "signal.step": "noticed", "signal.why": true },
      },
      {
        title: "Would you like help?",
        caption: "KBC asks Maria if someone she trusts may help her when needed. She can also say “not now”, or talk to someone at KBC.",
        why: "Help is offered, never imposed.",
        href: "/onboarding/signaal",
        as: ["maria", "maria"],
        ui: { "signal.step": "question" },
      },
      {
        title: "Maria picks three people",
        caption: "Maria chooses her daughter Sarah, her son Tom and her neighbour Ann. Large text, one choice per screen.",
        why: "The parent holds the key: she decides who is in her circle.",
        href: "/onboarding/ouder",
        as: ["maria", "maria"],
        ui: { "ouder.screen": { kind: "people" }, "ouder.selected": PEOPLE3 },
      },
      {
        title: "Sarah may pay bills",
        caption: "For Sarah, Maria chooses “Pay bills for me”: the Act role.",
        why: "Three simple roles: Alerts, View and Act.",
        href: "/onboarding/ouder",
        as: ["maria", "maria"],
        ui: { "ouder.screen": { kind: "role", i: 0 }, "ouder.selected": PEOPLE3, "ouder.roles": { sarah: "handelen" } },
      },
      {
        title: "Up to €500 per payment",
        caption: "Maria sets a limit. Above €500, Sarah has to ask her first.",
        why: "Maria stays in control of larger amounts.",
        href: "/onboarding/ouder",
        as: ["maria", "maria"],
        ui: { "ouder.screen": { kind: "limit", i: 0 }, "ouder.selected": PEOPLE3, "ouder.roles": { sarah: "handelen" }, "ouder.limit": 500 },
      },
      {
        title: "Tom may look",
        caption: "Tom gets “See my accounts”: the View role. He can follow along, but can't pay.",
        why: "Each person gets exactly the access Maria wants.",
        href: "/onboarding/ouder",
        as: ["maria", "maria"],
        ui: { "ouder.screen": { kind: "role", i: 1 }, "ouder.selected": PEOPLE3, "ouder.roles": { sarah: "handelen", tom: "inzage" } },
      },
      {
        title: "Ann gets an alert",
        caption: "Ann, the neighbour, only gets alerts. She never sees Maria's money.",
        why: "Even a neighbour can help, without seeing any finances.",
        href: "/onboarding/ouder",
        as: ["maria", "maria"],
        ui: { "ouder.screen": { kind: "role", i: 2 }, "ouder.selected": PEOPLE3, "ouder.roles": ALL_ROLES },
      },
      {
        title: "An if-then rule",
        caption: "Maria adds a rule: if something suspicious happens on her account, alert Sarah and Ann.",
        why: "KBC only acts on rules Maria set herself.",
        href: "/onboarding/ouder",
        as: ["maria", "maria"],
        ui: { "ouder.screen": { kind: "rules" }, "ouder.selected": PEOPLE3, "ouder.roles": ALL_ROLES },
      },
      {
        title: "Is this right?",
        caption: "Maria checks a short summary and confirms with her fingerprint, the way she always signs in the KBC app.",
        why: "Everything in one overview, before anything is shared.",
        href: "/onboarding/ouder",
        as: ["maria", "maria"],
        ui: { "ouder.screen": { kind: "summary" }, "ouder.selected": PEOPLE3, "ouder.roles": ALL_ROLES },
      },
      {
        title: "Maria's Mantel is ready",
        caption: "Sarah, Tom and Ann get an invitation.",
        why: "Set up in about a minute, by Maria herself.",
        href: "/onboarding/ouder",
        as: ["maria", "maria"],
        effect: () => actions.activateMantel("maria", MARIA_DEFAULT_PEOPLE, MARIA_DEFAULT_RULES, ELDERS.maria.limit),
        ui: { "ouder.screen": { kind: "done" }, "ouder.selected": PEOPLE3, "ouder.roles": ALL_ROLES },
      },
      {
        title: "Tom gets a text",
        caption: "Tom isn't a KBC customer. He gets a text message with a link to Maria's Mantel.",
        why: "Family members who bank elsewhere can still help.",
        href: "/gast",
        as: ["tom", "maria"],
        ui: { "gast.step": "sms" },
      },
      {
        title: "No KBC account needed",
        caption: "Tom sees what Maria chose for him, and joins as a guest.",
        why: "A low threshold for the whole family, and a first contact with KBC.",
        href: "/gast",
        as: ["tom", "maria"],
        ui: { "gast.step": "landing" },
      },
      {
        title: "Confirm with itsme",
        caption: "Tom confirms who he is with itsme. That's all.",
        why: "Safe identification, without opening an account.",
        href: "/gast",
        as: ["tom", "maria"],
        ui: { "gast.step": "itsme" },
      },
      {
        title: "Tom follows along",
        caption: "Tom now sees Maria's Mantel with the View role. Note the “guest” label at the top.",
        why: "Roles are always visible, so nobody wonders what they're allowed to do.",
        href: "/app",
        as: ["tom", "maria"],
        effect: () => actions.completeGuestJoin("maria", "tom"),
        focus: "role",
      },
      {
        title: "Maria's consent centre",
        caption: "Maria sees in large text who can do what, which rules are on, and what her family did.",
        why: "Transparency is a feature: Maria sees everything her family sees.",
        href: "/maria/toestemming",
        as: ["maria", "maria"],
      },
      {
        title: "One tap to stop",
        caption: "Maria removes Tom's access with one tap. It's gone straight away, and she can undo it.",
        why: "Maria can change or stop access at any time.",
        href: "/maria/toestemming",
        as: ["maria", "maria"],
        effect: () => actions.revoke("maria", "tom"),
        focus: "member-tom",
      },
    ],
  },
  {
    id: 2,
    title: "Sarah helps her parents",
    subtitle: "Sarah helps her mum and her father-in-law. She sees what's going on, arranges help and pays bills within Maria's limit.",
    people: ["sarah", "maria", "jozef"],
    prepare: () => actions.prepareStep(4),
    steps: [
      {
        title: "Sarah's overview",
        caption: "Sarah opens the Mantel of her mum Maria: her care situation, open tasks, signals and upcoming payments.",
        why: "One calm overview instead of ten apps and phone calls.",
        href: "/app",
        as: ["sarah", "maria"],
        focus: "role",
      },
      {
        title: "Two parents",
        caption: "Sarah also helps her father-in-law Jozef. At the top she switches between them, and sees her role for each.",
        why: "A role is per parent, because each parent sets it.",
        href: "/app",
        as: ["sarah", "maria"],
        ui: { "header.switcher": true },
      },
      {
        title: "Jozef: View only",
        caption: "For Jozef, Sarah has the View role. She can follow his care plan, but Pieter pays the bills.",
        why: "Sarah never wonders what she's allowed to do.",
        href: "/app",
        as: ["sarah", "jozef"],
        focus: "role",
      },
      {
        title: "Maria's finances",
        caption: "Back to Maria: her house, accounts, investments, insurance and loans in one overview.",
        why: "Only visible because Maria gave Sarah access.",
        href: "/app/vermogen",
        as: ["sarah", "maria"],
      },
      {
        title: "Care costs per month",
        caption: "Care costs went up since September: home nursing and the pharmacy.",
        why: "Rising costs become visible early, with tips to lower them.",
        href: "/app/vermogen",
        as: ["sarah", "maria"],
        focus: "care-costs",
      },
      {
        title: "Services for Maria",
        caption: "Partner services in Gent, filtered on Maria's needs. Each one says why it's recommended.",
        why: "The right help at the right time, from trusted partners.",
        href: "/app/diensten",
        as: ["sarah", "maria"],
      },
      {
        title: "Request Wit-Gele Kruis",
        caption: "Sarah requests home nursing and an occupational therapist. She sees exactly what is shared with Wit-Gele Kruis.",
        why: "Partners only get what's needed, never any financial data.",
        href: "/app/diensten",
        as: ["sarah", "maria"],
        ui: { "service.sheet": "wgk", "service.phase": "form" },
      },
      {
        title: "Requested",
        caption: "Wit-Gele Kruis will call within 2 working days. Maria gets a notification.",
        why: "A qualified lead for the partner, without any extra effort for the family.",
        href: "/app/diensten",
        as: ["sarah", "maria"],
        effect: () => actions.requestService("maria", "wgk", "Wit-Gele Kruis", "sarah", false),
        ui: { "service.sheet": "wgk", "service.phase": "done" },
      },
      {
        title: "A stair lift, with a KBC loan",
        caption: "Maria's bedroom is upstairs. Sarah asks for a stair lift quote, combined with a KBC Renovation Loan simulation.",
        why: "Care needs lead naturally to KBC products: loans and insurance.",
        href: "/app/diensten",
        as: ["sarah", "maria"],
        ui: { "service.sheet": "traplift", "service.phase": "form" },
        focus: "loan",
      },
      {
        title: "Bills to pay",
        caption: "Sarah has the Act role for Maria, up to €500 per payment.",
        why: "The limit Maria chose is always visible.",
        href: "/app/betalen",
        as: ["sarah", "maria"],
        effect: () => actions.requestService("maria", "traplift", "Traplift Vlaanderen", "sarah", true),
      },
      {
        title: "Paying for Maria",
        caption: "The Wit-Gele Kruis bill of €184.20 is within the limit. The screen clearly says Sarah is paying for Maria.",
        why: "Sarah signs as herself, never as Maria.",
        href: "/app/betalen",
        as: ["sarah", "maria"],
        ui: { "pay.phase": "review", "pay.bill": "wgk-okt" },
        focus: "limit",
      },
      {
        title: "Paid and logged",
        caption: "Paid. Maria got a notification, and the payment is in the log with Sarah's name.",
        why: "Every action is logged, and Maria sees the same log.",
        href: "/app/betalen",
        as: ["sarah", "maria"],
        effect: () => actions.payBill("maria", "wgk-okt", "sarah"),
        ui: { "pay.phase": "done", "pay.bill": "wgk-okt" },
      },
      {
        title: "Above the limit",
        caption: "The boiler repair costs €742. That's more than Maria allowed, so Sarah has to ask her first.",
        why: "Larger amounts always need Maria's approval.",
        href: "/app/betalen",
        as: ["sarah", "maria"],
        ui: { "pay.phase": "review", "pay.bill": "ketel" },
        focus: "limit",
      },
      {
        title: "Approval requested",
        caption: "Maria gets the question in her own app.",
        why: "No surprises: Maria decides about her own money.",
        href: "/app/betalen",
        as: ["sarah", "maria"],
        effect: () => actions.requestApproval("maria", "ketel", "sarah"),
        ui: { "pay.phase": "approval-sent", "pay.bill": "ketel" },
      },
      {
        title: "Maria decides",
        caption: "Maria sees one simple question, in large text: may Sarah pay this?",
        why: "One action per screen, for the person it's about.",
        href: "/maria/goedkeuren",
        as: ["maria", "maria"],
      },
      {
        title: "Approved",
        caption: "Maria says yes. The bill is paid, and Sarah gets a message.",
        why: "Help from the family, with Maria in charge.",
        href: "/maria/goedkeuren",
        as: ["maria", "maria"],
        effect: () => {
          const ap = getDemo().approvals.find((a) => a.billId === "ketel" && a.status === "pending");
          if (ap) actions.decideApproval(ap.id, true);
        },
        ui: { "approve.phase": "approved" },
      },
      {
        title: "The log",
        caption: "Everything that happened in Maria's Mantel, with who did it and when. Maria sees exactly the same.",
        why: "Trust through transparency.",
        href: "/app/logboek",
        as: ["sarah", "maria"],
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
        caption: "Someone tries to transfer €2,450 from Maria's account. KBC puts it on hold, and Maria's rule alerts Sarah.",
        why: "KBC already stops suspicious transfers. Now the people Maria chose know about it too.",
        href: "/app",
        as: ["sarah", "maria"],
        effect: () => actions.triggerFraud(),
        enter: () =>
          actions.push({
            title: "Alert from Maria's rule",
            body: `Unusual transfer of ${euro0(FRAUD_TX.amount)} put on hold. See what happened.`,
            href: "/app/fraude",
            tone: "alert",
            for: "sarah",
          }),
        focus: "fraud-card",
      },
      {
        title: "Why KBC stopped it",
        caption: "A new account number, a much higher amount than usual, and a device Maria never used before.",
        why: "Each alert says in plain language why KBC acted.",
        href: "/app/fraude",
        as: ["sarah", "maria"],
      },
      {
        title: "Who was alerted",
        caption: "Sarah and Ann were alerted. Tom wasn't: that's how Maria set up her rule.",
        why: "KBC only acts on the rules Maria chose.",
        href: "/app/fraude",
        as: ["sarah", "maria"],
        focus: "rule-card",
      },
      {
        title: "How Ann sees it",
        caption: "Ann has the Alerts role. She's asked to pop round or call Maria, but sees no amounts or account numbers.",
        why: "Ann can help Maria without seeing her money.",
        href: "/app",
        as: ["ann", "maria"],
      },
      {
        title: "Maria is asked too",
        caption: "Maria gets a simple question in large text: was this you?",
        why: "Maria stays involved in everything about her own account.",
        href: "/maria",
        as: ["maria", "maria"],
      },
      {
        title: "“No, that wasn't me”",
        caption: "Maria answers that she didn't make this transfer. Her money is still in her account.",
        why: "Calm, reassuring language, never alarming.",
        href: "/maria",
        as: ["maria", "maria"],
        effect: () => actions.answerFraud(),
      },
      {
        title: "Sarah calls her mum",
        caption: "Sarah calls Maria. Someone had called her pretending to be from the bank.",
        why: "A familiar voice helps, at exactly the right moment.",
        href: "/app/fraude",
        as: ["sarah", "maria"],
        ui: { "fraud.calling": true, "fraud.connected": true },
      },
      {
        title: "Blocking it with KBC",
        caption: "Sarah blocks the transfer together with the KBC fraud team, and the unknown device is disconnected.",
        why: "Family and KBC act together, within minutes.",
        href: "/app/fraude",
        as: ["sarah", "maria"],
        effect: () => actions.setFraud("blocking"),
      },
      {
        title: "Fraud stopped",
        caption: "€2,450 stayed in Maria's account, thanks to her own rule.",
        why: "Fraud prevented, and a family that trusts KBC a little more.",
        href: "/app/fraude",
        as: ["sarah", "maria"],
        effect: () => actions.setFraud("resolved"),
      },
      {
        title: "A win for the family",
        caption: "Longer at home, lower care costs, hours of coordination saved and fraud prevented.",
        why: "KBC Mantel makes care calmer for families.",
        href: "/kbc",
        as: ["sarah", "maria"],
        ui: { "kbc.tab": "win", "kbc.open": "familie" },
      },
      {
        title: "A win for KBC",
        caption: "Renovation loans, insurance, referral fees, assets that stay in the family, guests who become customers and less fraud.",
        why: "Growth that comes from trust.",
        href: "/kbc",
        as: ["sarah", "maria"],
        ui: { "kbc.tab": "win", "kbc.open": "kbc" },
        focus: "kbc-kbc",
      },
      {
        title: "A win for partners",
        caption: "Wit-Gele Kruis, Farmaline and care home groups get qualified leads that convert better, at a lower cost.",
        why: "Partners reach the right family at the right moment.",
        href: "/kbc",
        as: ["sarah", "maria"],
        ui: { "kbc.tab": "win", "kbc.open": "partners" },
        focus: "kbc-partners",
      },
      {
        title: "Built to scale",
        caption: "Maria's Mantel is a template: the same roles, rules and partner catalogue work for every family.",
        why: "From one family to hundreds of thousands of Mantels.",
        href: "/kbc",
        as: ["sarah", "maria"],
        ui: { "kbc.tab": "scale" },
      },
    ],
  },
];

export const tourById = (id: number) => TOURS.find((t) => t.id === id)!;

type Router = { push: (href: string) => void };

/** Rebuild the demo for step `index` of a path and show it. */
export function goToStep(id: number, index: number, router: Router, pathname: string) {
  const tour = tourById(id);
  const step = tour.steps[index];
  tour.prepare();
  tour.steps.slice(0, index + 1).forEach((s) => s.effect?.());
  actions.setViewer(step.as[0], step.as[1]);
  actions.setTour({ path: id, step: index });
  step.enter?.();
  if (step.href !== pathname) router.push(step.href);
}

export function startTour(id: number, router: Router) {
  goToStep(id, 0, router, "");
}

/** The UI state that the current tour step imposes on the screens, or null outside a tour. */
export function useScene(): Record<string, unknown> | null {
  const s = useDemo();
  if (!s.tour) return null;
  const step = tourById(s.tour.path).steps[s.tour.step];
  return step?.ui ?? {};
}

/** A single UI value from the current scene (undefined when the scene does not set it). */
export function useSceneValue<T>(key: string): T | undefined {
  return useScene()?.[key] as T | undefined;
}
