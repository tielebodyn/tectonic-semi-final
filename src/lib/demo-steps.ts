"use client";

import { actions, FRAUD_TX } from "./store";
import { euro0 } from "./format";

export type DemoStep = {
  n: number;
  title: string;
  detail: string;
  href: string;
  /** Prepare the demo state; returns where to navigate to. */
  run: () => string;
};

export const DEMO_STEPS: DemoStep[] = [
  {
    n: 1,
    title: "KBC vraagt Maria of ze hulp wil",
    detail: "Signalen op Maria's rekening. KBC vraagt het aan Maria, nooit aan haar kinderen.",
    href: "/onboarding/signaal",
    run: () => {
      actions.prepareStep(1);
      return "/onboarding/signaal";
    },
  },
  {
    n: 2,
    title: "Maria kiest wie haar helpt",
    detail: "Sarah krijgt Handelen, Tom Inzage, Ann Meldingen. Plus één fraude-regel.",
    href: "/onboarding/ouder",
    run: () => {
      actions.prepareStep(2);
      return "/onboarding/ouder";
    },
  },
  {
    n: 3,
    title: "Tom sluit aan als gast via itsme",
    detail: "Geen KBC-rekening nodig.",
    href: "/gast",
    run: () => {
      actions.prepareStep(3);
      return "/gast";
    },
  },
  {
    n: 4,
    title: "Sarah: Maria & Jozef, vermogen, diensten",
    detail: "Wisselen tussen ouders, vermogen bekijken, Wit-Gele Kruis en een traplift met renovatielening aanvragen.",
    href: "/app",
    run: () => {
      actions.prepareStep(4);
      return "/app";
    },
  },
  {
    n: 5,
    title: "Sarah betaalt namens Maria",
    detail: "Limietcheck, bevestiging en logboek. Boven de limiet keurt Maria goed.",
    href: "/app/betalen",
    run: () => {
      actions.prepareStep(5);
      return "/app/betalen";
    },
  },
  {
    n: 6,
    title: "Een fraudepoging wordt gestopt",
    detail: `Een overschrijving van ${euro0(FRAUD_TX.amount)} naar een onbekend rekeningnummer. Maria's regel verwittigt Sarah en Ann.`,
    href: "/app",
    run: () => {
      actions.prepareStep(6);
      setTimeout(() => {
        actions.triggerFraud();
        actions.push({
          title: "Melding volgens Maria's regel",
          body: `Ongewone overschrijving van ${euro0(FRAUD_TX.amount)} tegengehouden. Bekijk wat er gebeurde.`,
          href: "/app/fraude",
          tone: "alert",
          for: "sarah",
        });
      }, 1400);
      return "/app";
    },
  },
  {
    n: 7,
    title: "Triple win: familie, KBC, partners",
    detail: "Het KBC-zicht voor de jury, plus de schaal.",
    href: "/kbc",
    run: () => "/kbc",
  },
];
