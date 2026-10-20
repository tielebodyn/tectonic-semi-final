"use client";

import { euro0 } from "./format";
import { actions, FRAUD_TX, getDemo, type DemoState } from "./store";
import type { PersonId } from "./types";

export type TourStep = {
  title: string;
  /** What the jury should tap on this screen */
  hint: string;
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
    title: "Maria houdt de sleutel",
    subtitle: "KBC merkt iets op en vraagt het aan Maria zelf. Zij kiest wie haar helpt, en wat die persoon mag.",
    people: ["maria", "sarah", "tom"],
    prepare: () => actions.prepareStep(1),
    steps: [
      {
        title: "Een signaal van KBC",
        hint: "KBC ziet veranderingen op Maria's rekening en vraagt het aan Maria, nooit aan haar kinderen. Lees het bericht en tik op “Waarom zie ik dit?”.",
        href: "/onboarding/signaal",
        setup: () => actions.setViewer("maria", "maria"),
        done: (_, path) => path === "/onboarding/ouder",
      },
      {
        title: "Maria kiest wie haar helpt",
        hint: "Kies Sarah, Tom en Ann. Sarah mag betalen, Tom mag kijken, Ann krijgt enkel een bericht. Laat de fraude-regel aan en bevestig.",
        href: "/onboarding/ouder",
        setup: () => actions.setViewer("maria", "maria"),
        done: (s) => s.mantel.maria === "active",
      },
      {
        title: "Tom sluit aan als gast",
        hint: "Tom is geen KBC-klant. Tik op de link in de sms, bevestig met itsme en kijk mee in Maria's Mantel.",
        href: "/gast",
        setup: () => {
          actions.ensureMariaMantel();
          actions.setViewer("tom", "maria");
        },
        done: (s) => s.circles.maria.some((m) => m.personId === "tom" && m.status === "active"),
      },
      {
        title: "Maria kan altijd stoppen",
        hint: "In grote letters ziet Maria wie wat mag. Tik bij Tom op “Stoppen”: zijn toegang is meteen weg. Daarna kan u het ongedaan maken.",
        href: "/maria/toestemming",
        setup: () => {
          actions.ensureMariaMantel();
          actions.setViewer("maria", "maria");
        },
        done: (s) => s.audit.maria.some((e) => e.text.includes("stopte de toegang")),
      },
    ],
  },
  {
    id: 2,
    title: "Sarah zorgt mee",
    subtitle: "Sarah zorgt voor haar mama én haar schoonvader. Ze ziet het vermogen, vraagt hulp aan en betaalt binnen Maria's limiet.",
    people: ["sarah", "maria", "jozef"],
    prepare: () => actions.prepareStep(4),
    steps: [
      {
        title: "Twee ouders, twee rollen",
        hint: "Tik bovenaan op Maria en wissel naar Jozef. Bij Jozef heeft Sarah enkel Inzage: kijken, niet betalen.",
        href: "/app",
        setup: () => actions.setViewer("sarah", "maria"),
        done: (s) => s.activeElder === "jozef",
      },
      {
        title: "Het vermogen van Maria",
        hint: "Wissel terug naar Maria en open Vermogen onderaan: woning, rekeningen, verzekeringen en de zorgkosten per maand.",
        href: "/app",
        setup: () => actions.setViewer("sarah", "jozef"),
        done: (s, path) => s.activeElder === "maria" && path === "/app/vermogen",
      },
      {
        title: "Hulp aanvragen",
        hint: "KBC beveelt diensten aan op basis van Maria's situatie. Vraag Wit-Gele Kruis aan, en een traplift-offerte met KBC Renovatielening.",
        href: "/app/diensten",
        setup: () => actions.setViewer("sarah", "maria"),
        done: (s) => ["wgk", "traplift"].every((id) => s.requested.maria.some((r) => r.serviceId === id)),
      },
      {
        title: "Betalen namens Maria",
        hint: "Betaal de factuur van Wit-Gele Kruis. Dat is binnen Maria's limiet van €500, en Maria krijgt er een melding van.",
        href: "/app/betalen",
        setup: () => actions.setViewer("sarah", "maria"),
        done: (s) => s.bills.maria.some((b) => b.id === "wgk-okt" && b.status === "paid"),
      },
      {
        title: "Boven de limiet",
        hint: "Tik op “Nog een factuur betalen” en kies de verwarmingsketel van €742. Dat is meer dan Maria toeliet: Sarah vraagt eerst haar goedkeuring.",
        href: "/app/betalen",
        setup: () => actions.setViewer("sarah", "maria"),
        done: (s) => s.approvals.some((a) => a.billId === "ketel"),
      },
      {
        title: "Maria beslist",
        hint: "Maria krijgt de vraag in haar eigen app, in grote letters. Keur de betaling goed.",
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
    title: "Samen veilig",
    subtitle: "Iemand probeert geld van Maria's rekening te halen. Haar eigen regel verwittigt de juiste mensen. Daarna: wat levert het op?",
    people: ["sarah", "ann", "maria"],
    prepare: () => actions.prepareStep(4),
    steps: [
      {
        title: "Een melding komt binnen",
        hint: "Er komt zo een melding binnen op Sarah's gsm, volgens de regel die Maria zelf koos. Tik op de melding.",
        href: "/app",
        setup: () => {
          actions.setViewer("sarah", "maria");
          setTimeout(() => {
            if (getDemo().fraud !== "none") return;
            actions.triggerFraud();
            actions.push({
              title: "Melding volgens Maria's regel",
              body: `Ongewone overschrijving van ${euro0(FRAUD_TX.amount)} tegengehouden. Bekijk wat er gebeurde.`,
              href: "/app/fraude",
              tone: "alert",
              for: "sarah",
            });
          }, 1500);
        },
        done: (_, path) => path === "/app/fraude",
      },
      {
        title: "Waarom KBC dit tegenhield",
        hint: "Bekijk waarom de overschrijving ongewoon is, en wie verwittigd werd. Tom niet: zo koos Maria het.",
        href: "/app/fraude",
        setup: () => {
          ensureFraud();
          actions.setViewer("sarah", "maria");
        },
      },
      {
        title: "Zo ziet Ann het",
        hint: "Ann, de buurvrouw, heeft enkel de rol Meldingen. Ze krijgt een seintje om even langs te gaan, maar ziet geen bedragen of rekeningen.",
        href: "/app",
        setup: () => {
          ensureFraud();
          actions.setViewer("ann", "maria");
        },
      },
      {
        title: "Samen blokkeren",
        hint: "Terug bij Sarah: tik op “Bel mama” en blokkeer de overschrijving daarna samen met KBC.",
        href: "/app/fraude",
        setup: () => {
          ensureFraud();
          actions.setViewer("sarah", "maria");
        },
        done: (s) => s.fraud === "resolved",
      },
      {
        title: "Triple win",
        hint: "Wat levert KBC Mantel op voor de familie, voor KBC en voor de partners? Bekijk ook het tabblad Schaal.",
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
