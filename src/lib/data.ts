import type { Bill, ElderId, Person, PersonId, Region, RoleId } from "./types";

/** The fixed "today" of the demo, so dummy dates always read naturally. */
export const DEMO_TODAY = "2026-10-20";

export const PEOPLE: Record<PersonId, Person> = {
  maria: { id: "maria", firstName: "Maria", lastName: "Peeters", age: 79, city: "Ghent", isKbcCustomer: true, tone: "bg-rose-100 text-rose-800" },
  jozef: { id: "jozef", firstName: "Jozef", lastName: "Claes", age: 84, city: "Aalst", isKbcCustomer: true, tone: "bg-amber-100 text-amber-800" },
  sarah: { id: "sarah", firstName: "Sarah", lastName: "Peeters", age: 48, city: "Ghent", isKbcCustomer: true, tone: "bg-sky-100 text-sky-800" },
  tom: { id: "tom", firstName: "Tom", lastName: "Peeters", age: 45, city: "Antwerp", isKbcCustomer: false, tone: "bg-emerald-100 text-emerald-800" },
  ann: { id: "ann", firstName: "Ann", lastName: "Verhaeghe", age: 72, city: "Ghent", isKbcCustomer: false, tone: "bg-violet-100 text-violet-800" },
  pieter: { id: "pieter", firstName: "Pieter", lastName: "Claes", age: 51, city: "Ghent", isKbcCustomer: true, tone: "bg-indigo-100 text-indigo-800" },
  lieve: { id: "lieve", firstName: "Lieve", lastName: "Claes", age: 55, city: "Brussels", isKbcCustomer: false, tone: "bg-teal-100 text-teal-800" },
};

export const fullName = (id: PersonId) => `${PEOPLE[id].firstName} ${PEOPLE[id].lastName}`;
export const firstName = (id: PersonId) => PEOPLE[id].firstName;

export const ROLES: Record<RoleId, { label: string; short: string; can: string[]; cannot: string[] }> = {
  meldingen: {
    label: "Alerts",
    short: "Gets an alert when something needs attention. Can't see balances.",
    can: ["Gets alerts, based on the rules the parent chose"],
    cannot: ["See balances or assets", "Make payments"],
  },
  inzage: {
    label: "View",
    short: "Can see accounts, assets and care costs. Can't pay.",
    can: ["See accounts and assets", "Follow care costs and insights", "Request services"],
    cannot: ["Make payments or transfers"],
  },
  handelen: {
    label: "Pay",
    short: "Can pay bills, up to the limit the parent set.",
    can: ["Everything in View", "Pay bills up to the limit", "Manage the care budget"],
    cannot: ["Pay above the limit without the parent's approval"],
  },
};

export type ElderProfile = {
  id: ElderId;
  region: Region;
  address: string;
  living: string;
  careLevel: string;
  careSummary: string;
  gp: string;
  limit: number;
  iban: string;
};

export const ELDERS: Record<ElderId, ElderProfile> = {
  maria: {
    id: "maria",
    region: "Ghent",
    address: "Kasteellaan 112, 9000 Ghent",
    living: "Lives alone in her own house",
    careLevel: "Light care needs",
    careSummary: "Home nursing 3 times a week since September, after a short stay in hospital.",
    gp: "Dr Van Damme",
    limit: 500,
    iban: "BE68 7340 1234 5678",
  },
  jozef: {
    id: "jozef",
    region: "Aalst",
    address: "Kerkstraat 18 box 2, 9300 Aalst",
    living: "Lives alone in a flat",
    careLevel: "High care needs",
    careSummary: "Daily home nursing, home help and day care twice a week. Looking for a care home.",
    gp: "Dr De Wolf",
    limit: 750,
    iban: "BE12 7350 9876 5432",
  },
};

// ---------------------------------------------------------------------------
// Assets

export type AssetGroup = {
  title: string;
  items: { name: string; detail: string; value?: number; note?: string; trend?: string }[];
};

export const ASSETS: Record<ElderId, { home: { name: string; detail: string; value: number; note: string }; groups: AssetGroup[]; monthlyIncome: number }> = {
  maria: {
    home: {
      name: "Terraced house, Ghent",
      detail: "2 floors · bedroom and bathroom upstairs · fully paid off",
      value: 385000,
      note: "Estimate based on the KBC house price index (Oct 2026)",
    },
    monthlyIncome: 1780,
    groups: [
      {
        title: "Accounts",
        items: [
          { name: "Current account", detail: "BE68 7340 1234 5678", value: 4230.55 },
          { name: "Savings account", detail: "KBC Savings Account", value: 38900 },
        ],
      },
      {
        title: "Investments",
        items: [
          { name: "Defensive mixed fund", detail: "Investment portfolio", value: 48200, trend: "+2.4% this year" },
          { name: "European equity fund", detail: "Investment portfolio", value: 9750, trend: "+5.1% this year" },
          { name: "KBC Group shares", detail: "60 shares", value: 4400, trend: "+8.0% this year" },
        ],
      },
      {
        title: "Insurance",
        items: [
          { name: "KBC Hospitalisation Insurance", detail: "Hospital Care · covers aftercare up to 90 days", note: "Sept: €1,840 paid back" },
          { name: "KBC Home Insurance", detail: "Kasteellaan 112", note: "Active" },
          { name: "Family liability insurance", detail: "Third-party liability", note: "Active" },
        ],
      },
      {
        title: "Loans",
        items: [{ name: "No loans", detail: "Home loan fully repaid in 2014" }],
      },
    ],
  },
  jozef: {
    home: {
      name: "Flat, Aalst",
      detail: "Ground floor · lift in the building · fully paid off",
      value: 238000,
      note: "Estimate based on the KBC house price index (Oct 2026)",
    },
    monthlyIncome: 1940,
    groups: [
      {
        title: "Accounts",
        items: [
          { name: "Current account", detail: "BE12 7350 9876 5432", value: 2870.1 },
          { name: "Savings account", detail: "KBC Savings Account", value: 61300 },
        ],
      },
      {
        title: "Investments",
        items: [{ name: "Defensive mixed fund", detail: "Investment portfolio", value: 22400, trend: "+2.1% this year" }],
      },
      {
        title: "Insurance",
        items: [
          { name: "KBC Hospitalisation Insurance", detail: "Hospital Care", note: "Active" },
          { name: "KBC Home Insurance", detail: "Kerkstraat 18", note: "Active" },
        ],
      },
      {
        title: "Loans",
        items: [{ name: "No loans", detail: "" }],
      },
    ],
  },
};

/** Monthly care costs, last six months, in euro. */
export const CARE_COSTS: Record<ElderId, { month: string; nursing: number; pharmacy: number; help: number }[]> = {
  maria: [
    { month: "May", nursing: 0, pharmacy: 22, help: 0 },
    { month: "Jun", nursing: 0, pharmacy: 25, help: 0 },
    { month: "Jul", nursing: 0, pharmacy: 24, help: 0 },
    { month: "Aug", nursing: 0, pharmacy: 38, help: 0 },
    { month: "Sep", nursing: 184.2, pharmacy: 61, help: 0 },
    { month: "Oct", nursing: 184.2, pharmacy: 64.1, help: 0 },
  ],
  jozef: [
    { month: "May", nursing: 198, pharmacy: 71, help: 248 },
    { month: "Jun", nursing: 205, pharmacy: 69, help: 260 },
    { month: "Jul", nursing: 214, pharmacy: 74, help: 286 },
    { month: "Aug", nursing: 228, pharmacy: 78, help: 312 },
    { month: "Sep", nursing: 236, pharmacy: 81, help: 492 },
    { month: "Oct", nursing: 236, pharmacy: 83, help: 492 },
  ],
};

export const RECURRING: Record<ElderId, { name: string; detail: string; amount: number }[]> = {
  maria: [
    { name: "Wit-Gele Kruis", detail: "Home nursing · since Sept", amount: 184.2 },
    { name: "De Brug Pharmacy", detail: "Medication", amount: 64.1 },
  ],
  jozef: [
    { name: "Wit-Gele Kruis", detail: "Daily home nursing", amount: 236 },
    { name: "Familiehulp", detail: "Home help, 6 hrs a week", amount: 312 },
    { name: "Den Bogaard day care", detail: "Twice a week", amount: 180 },
    { name: "Pharmacy", detail: "Medication", amount: 83 },
  ],
};

// ---------------------------------------------------------------------------
// Bills

export const INITIAL_BILLS: Record<ElderId, Bill[]> = {
  maria: [
    { id: "wgk-okt", payee: "Wit-Gele Kruis Oost-Vlaanderen", description: "Home nursing, October", amount: 184.2, due: "2026-10-28", iban: "BE21 4420 0000 1203", reference: "+++090/2610/48213+++", status: "open" },
    { id: "apo-okt", payee: "De Brug Pharmacy", description: "Medication, October", amount: 64.1, due: "2026-10-31", iban: "BE55 0016 2203 4471", reference: "Invoice 2026-1088", status: "open" },
    { id: "ketel", payee: "De Pauw Heating", description: "Boiler repair", amount: 742, due: "2026-11-04", iban: "BE90 7370 1122 3344", reference: "+++112/0045/77801+++", status: "open" },
  ],
  jozef: [
    { id: "fh-okt", payee: "Familiehulp", description: "Home help, October", amount: 312, due: "2026-10-30", iban: "BE33 7995 1234 0001", reference: "+++200/1026/33019+++", status: "open" },
    { id: "dv-okt", payee: "Den Bogaard day care", description: "Day care, October", amount: 180, due: "2026-11-02", iban: "BE77 0689 4410 2290", reference: "Invoice DB-2026-341", status: "open" },
  ],
};

// ---------------------------------------------------------------------------
// Tasks (care checklist)

export const TASKS: Record<ElderId, { id: string; title: string; detail: string }[]> = {
  maria: [
    { id: "t-bill", title: "Pay the Wit-Gele Kruis bill", detail: "Due on 28 October" },
    { id: "t-zorgbudget", title: "Apply for the care allowance for older people", detail: "Through the care fund · up to about €140 a month" },
    { id: "t-volmacht", title: "Talk to Mum about a care power of attorney", detail: "Discuss what she would like to arrange" },
    { id: "t-traplift", title: "Look at a stair lift quote", detail: "Her bedroom is upstairs" },
  ],
  jozef: [
    { id: "j-bezoek", title: "Visit Hof ter Linden care home", detail: "With Pieter, on Saturday" },
    { id: "j-wachtlijst", title: "Follow up the De Kastanjelaar waiting list", detail: "Number 6 · about 4 months" },
    { id: "j-budget", title: "Care allowance for high care needs", detail: "Application in progress at the care fund" },
  ],
};

// ---------------------------------------------------------------------------
// Signals

export type Signal = {
  id: string;
  elder: ElderId;
  icon: "nurse" | "pill" | "cart" | "hospital" | "stairs" | "scroll" | "home" | "bed" | "euro";
  title: string;
  body: string;
  reason: string[];
  cta: { label: string; href: string };
  date: string;
};

export const SIGNALS: Signal[] = [
  {
    id: "s-wgk",
    elder: "maria",
    icon: "nurse",
    title: "Maria has been paying for home nursing for 2 months",
    body: "There may be support she's entitled to. For example, the care allowance for older people with care needs.",
    reason: ["Since September, €184.20 goes to Wit-Gele Kruis every month.", "A regular payment for home nursing often means there's a (temporary) care need."],
    cta: { label: "See support options", href: "/app/diensten" },
    date: "2026-10-18",
  },
  {
    id: "s-stairs",
    elder: "maria",
    icon: "stairs",
    title: "Maria's bedroom and bathroom are upstairs",
    body: "A stair lift can make it easier for her to keep living at home. You can spread the cost with a KBC Renovation Loan.",
    reason: ["Her home insurance lists a house with 2 floors.", "After a hospital stay, stairs often become harder."],
    cta: { label: "See home adaptations", href: "/app/diensten" },
    date: "2026-10-17",
  },
  {
    id: "s-pharm",
    elder: "maria",
    icon: "pill",
    title: "Maria is spending more at the pharmacy",
    body: "Having medication delivered to her door saves her a trip.",
    reason: ["Until July, about €24 a month. Now €64 a month."],
    cta: { label: "See home delivery", href: "/app/diensten" },
    date: "2026-10-15",
  },
  {
    id: "s-food",
    elder: "maria",
    icon: "cart",
    title: "Maria is going to the supermarket less often",
    body: "Cooking or shopping may have become harder. A meal delivery service may help.",
    reason: ["Supermarket payments dropped from about 9 to 3 a month."],
    cta: { label: "See meals at home", href: "/app/diensten" },
    date: "2026-10-12",
  },
  {
    id: "s-hosp",
    elder: "maria",
    icon: "hospital",
    title: "Her hospitalisation insurance paid back €1,840",
    body: "Aftercare at home up to 90 days after the hospital stay may also be covered. Keep the home nursing bills.",
    reason: ["In September, Maria was admitted to AZ Sint-Lucas.", "Maria has KBC Hospital Care."],
    cta: { label: "See insurance", href: "/app/vermogen" },
    date: "2026-09-29",
  },
  {
    id: "s-volmacht",
    elder: "maria",
    icon: "scroll",
    title: "There's no care power of attorney yet",
    body: "A care power of attorney lets Maria choose who can manage her affairs if she can no longer do so herself.",
    reason: ["We found no registered care power of attorney at KBC.", "It's easier to arrange this before it's needed."],
    cta: { label: "See notaries", href: "/app/diensten" },
    date: "2026-10-10",
  },
  {
    id: "j-wait",
    elder: "jozef",
    icon: "home",
    title: "Jozef is on 1 care home waiting list",
    body: "A room becomes available at Hof ter Linden in November. Would you like to plan a visit?",
    reason: ["Jozef is number 6 on the De Kastanjelaar list.", "Hof ter Linden is 2.1 km away and fits his budget."],
    cta: { label: "See care homes", href: "/app/diensten/woonzorg" },
    date: "2026-10-19",
  },
  {
    id: "j-short",
    elder: "jozef",
    icon: "bed",
    title: "A short stay can make the move easier",
    body: "A short stay of a few weeks lets Jozef get to know a care home. It also gives the family some time off.",
    reason: ["Jozef's care costs went up by about €180 in September.", "A short stay is possible at 2 care homes nearby."],
    cta: { label: "Find a short stay", href: "/app/diensten/woonzorg" },
    date: "2026-10-14",
  },
  {
    id: "j-budget",
    elder: "jozef",
    icon: "euro",
    title: "Jozef may be entitled to the care allowance for high care needs",
    body: "It's a fixed monthly amount from Flemish social protection. You apply through the care fund.",
    reason: ["There are regular payments for home nursing, home help and day care."],
    cta: { label: "See care costs", href: "/app/vermogen" },
    date: "2026-10-08",
  },
];

// ---------------------------------------------------------------------------
// Partner services

export type ServiceCategory = "thuiszorg" | "apotheek" | "veiligheid" | "maaltijden" | "woning" | "woonzorg" | "juridisch";

export const CATEGORIES: { id: ServiceCategory | "alles"; label: string }[] = [
  { id: "alles", label: "All" },
  { id: "thuiszorg", label: "Care at home" },
  { id: "woning", label: "Home adaptations" },
  { id: "apotheek", label: "Pharmacy" },
  { id: "maaltijden", label: "Meals" },
  { id: "veiligheid", label: "Safety" },
  { id: "woonzorg", label: "Care homes" },
  { id: "juridisch", label: "Legal" },
];

export type Service = {
  id: string;
  partner: string;
  name: string;
  category: ServiceCategory;
  regions: Region[];
  description: string;
  price: string;
  /** Why it is recommended, per elder. Missing key = not specifically recommended. */
  why: Partial<Record<ElderId, string>>;
  generic: string;
  kbc?: { product: string; detail: string };
  cta: string;
  confirm: string;
  /** What gets shared with the partner. "the parent's" is replaced by the elder's name. */
  shares: string;
  loan?: { amount: number; months: number; monthly: number; rate: string };
  monogram: string;
  tone: string;
};

export const SERVICES: Service[] = [
  {
    id: "wgk",
    partner: "Wit-Gele Kruis",
    name: "Home nursing & occupational therapist",
    category: "thuiszorg",
    regions: ["Ghent", "Aalst"],
    description: "More home nursing, plus a home visit from an occupational therapist who looks at how to make the house safer and more comfortable.",
    price: "Home nursing on prescription: usually fully reimbursed. Occupational therapist visit: free.",
    why: {
      maria: "Maria already gets home nursing and her bedroom is upstairs. An occupational therapist can look at what she needs.",
      jozef: "Jozef gets home nursing every day. A care plan helps with the move to a care home.",
    },
    generic: "Home nursing in your area.",
    kbc: { product: "KBC Hospitalisation Insurance", detail: "Aftercare up to 90 days after a hospital stay may be covered" },
    cta: "Request",
    confirm: "Wit-Gele Kruis will call you within 2 working days to plan a home visit.",
    shares: "the parent's name, address and phone number, and your contact details",
    monogram: "WGK",
    tone: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    id: "traplift",
    partner: "Traplift Vlaanderen",
    name: "Made-to-measure stair lift",
    category: "woning",
    regions: ["Ghent", "Aalst"],
    description: "Free measuring at home and a quote for a straight or curved stair lift. Installed within 3 weeks.",
    price: "€4,500 – €8,500 · Flemish adaptation grant possible",
    why: { maria: "Maria's bedroom and bathroom are upstairs. With a stair lift, she can keep using the whole house." },
    generic: "A stair lift made to fit your stairs.",
    kbc: { product: "KBC Renovation Loan", detail: "Spread the cost, e.g. €6,800 over 5 years" },
    loan: { amount: 6800, months: 60, monthly: 125.4, rate: "4.15% APR (indicative)" },
    cta: "Request a quote",
    confirm: "Traplift Vlaanderen will plan the free measuring visit and send a quote within 5 working days.",
    shares: "the parent's name and address, and your contact details",
    monogram: "TV",
    tone: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  {
    id: "farmaline",
    partner: "Farmaline",
    name: "Online pharmacy with home delivery",
    category: "apotheek",
    regions: ["Ghent", "Aalst"],
    description: "Prescriptions and medication delivered to the door, with a reminder when it's time to reorder.",
    price: "Free delivery from €39",
    why: {
      maria: "Maria's pharmacy costs went up from €24 to €64 a month. Home delivery saves her the trip.",
      jozef: "Jozef takes medication every day. Home delivery takes something off Pieter's plate.",
    },
    generic: "Medication delivered to your home.",
    kbc: { product: "KBC direct debit", detail: "Paid automatically from the current account" },
    cta: "Request",
    confirm: "Farmaline will send a confirmation. The first delivery can arrive as soon as tomorrow.",
    shares: "the parent's name and delivery address",
    monogram: "F",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    id: "familiehulp",
    partner: "Familiehulp",
    name: "Home help & cleaning",
    category: "thuiszorg",
    regions: ["Ghent", "Aalst"],
    description: "Help with housework, shopping and personal care, from the same carer every time.",
    price: "€4 – €15 an hour, depending on income",
    why: { maria: "Maria pays at the supermarket less often and was recently in hospital. Help with shopping and housework may be useful." },
    generic: "Help with housework and shopping.",
    cta: "Request",
    confirm: "A social worker from Familiehulp will come by to get to know you.",
    shares: "the parent's name, address and phone number",
    monogram: "FH",
    tone: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  {
    id: "maaltijden",
    partner: "Smakelijk Thuis",
    name: "Hot meals at home",
    category: "maaltijden",
    regions: ["Ghent", "Aalst"],
    description: "A healthy hot meal every lunchtime or a few days a week, adapted to dietary needs.",
    price: "€9.50 per meal",
    why: { maria: "Maria goes to the supermarket less often. With meals delivered, she doesn't have to shop and cook every day." },
    generic: "Hot meals delivered to your home.",
    cta: "Request",
    confirm: "Smakelijk Thuis will call to agree on the days and the menu.",
    shares: "the parent's name and address",
    monogram: "ST",
    tone: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  {
    id: "alarm",
    partner: "Vitas Personal Alarm",
    name: "Personal alarm, 24/7",
    category: "veiligheid",
    regions: ["Ghent", "Aalst"],
    description: "A button worn around the neck or wrist. When pressed, an operator answers and sends help, day and night.",
    price: "€19.50 a month",
    why: { maria: "Maria lives alone. With a personal alarm, she can call for help at any time." },
    generic: "A personal alarm with a 24/7 response service.",
    kbc: { product: "KBC Home Insurance", detail: "€5 a month off for customers" },
    cta: "Request",
    confirm: "Vitas will install the alarm within a week.",
    shares: "the parent's name, address and emergency contacts",
    monogram: "V",
    tone: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  {
    id: "badkamer",
    partner: "Badkamer Zorgeloos",
    name: "Walk-in shower & adapted bathroom",
    category: "woning",
    regions: ["Ghent", "Aalst"],
    description: "A safe bathroom with a walk-in shower, grab rails and non-slip floor. Can also go on the ground floor.",
    price: "€7,000 – €14,000 · adaptation grant possible",
    why: { maria: "The bathroom is upstairs. A shower downstairs can be an alternative to a stair lift." },
    generic: "A bathroom with a walk-in shower and no steps.",
    kbc: { product: "KBC Renovation Loan", detail: "Spread the cost over 2 to 10 years" },
    loan: { amount: 10000, months: 84, monthly: 137.2, rate: "4.15% APR (indicative)" },
    cta: "Request a quote",
    confirm: "Badkamer Zorgeloos will plan a free advice visit.",
    shares: "the parent's name and address",
    monogram: "BZ",
    tone: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  {
    id: "notaris-gent",
    partner: "Van den Berghe Notary",
    name: "Draw up a care power of attorney",
    category: "juridisch",
    regions: ["Ghent"],
    description: "An appointment at home or at the notary's office. The parent decides who can manage their affairs later.",
    price: "About €250 – €350, registration included",
    why: { maria: "There's no care power of attorney yet. With one, Maria can choose who will manage her affairs if she can no longer do so herself." },
    generic: "A notary helps you choose who can manage your affairs later.",
    kbc: { product: "KBC info session on care powers of attorney", detail: "Free, online or at your branch" },
    cta: "Request an appointment",
    confirm: "The Van den Berghe notary office will call to make an appointment.",
    shares: "the parent's name and phone number",
    monogram: "N",
    tone: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  {
    id: "notaris-aalst",
    partner: "De Clercq Notary",
    name: "Draw up a care power of attorney",
    category: "juridisch",
    regions: ["Aalst"],
    description: "An appointment at home or at the notary's office. The parent decides who can manage their affairs later.",
    price: "About €250 – €350, registration included",
    why: { jozef: "Jozef already gave Pieter a care power of attorney. It may need updating if he moves." },
    generic: "A notary helps you choose who can manage your affairs later.",
    kbc: { product: "KBC info session on care powers of attorney", detail: "Free, online or at your branch" },
    cta: "Request an appointment",
    confirm: "The De Clercq notary office will call to make an appointment.",
    shares: "the parent's name and phone number",
    monogram: "N",
    tone: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  {
    id: "dagverzorging",
    partner: "Den Bogaard",
    name: "An extra day of day care",
    category: "thuiszorg",
    regions: ["Aalst"],
    description: "A day at a day care centre, with transport to and from home.",
    price: "€30 a day, transport included",
    why: { jozef: "Jozef already goes twice a week. A third day gives Pieter an extra day off from caring." },
    generic: "Day care with transport to and from home.",
    cta: "Request",
    confirm: "Den Bogaard will confirm the extra day within 1 working day.",
    shares: "the parent's name",
    monogram: "DB",
    tone: "bg-lime-50 text-lime-700 ring-lime-200",
  },
];

// ---------------------------------------------------------------------------
// Care homes

export type CareType = "Residential" | "Short stay" | "Day care" | "Assisted living" | "Dementia care";

export type CareHome = {
  id: string;
  name: string;
  city: string;
  region: Region;
  distanceKm: number;
  priceMin: number;
  priceMax: number;
  types: CareType[];
  availability: { free: boolean; text: string };
  description: string;
  features: string[];
};

export const CARE_HOMES: CareHome[] = [
  {
    id: "hof-ter-linden",
    name: "Hof ter Linden",
    city: "Aalst",
    region: "Aalst",
    distanceKm: 2.1,
    priceMin: 68,
    priceMax: 79,
    types: ["Residential", "Short stay", "Dementia care"],
    availability: { free: true, text: "1 room free from November" },
    description: "A small-scale care home with a large garden, within walking distance of Aalst town centre.",
    features: ["Private bathroom", "Vegetable garden", "Hairdresser", "Pets welcome"],
  },
  {
    id: "kastanjelaar",
    name: "De Kastanjelaar",
    city: "Erembodegem",
    region: "Aalst",
    distanceKm: 4.8,
    priceMin: 62,
    priceMax: 71,
    types: ["Residential", "Day care"],
    availability: { free: false, text: "Waiting list about 4 months" },
    description: "A quiet care home with a warm, family feel and plenty of activities.",
    features: ["Cafeteria", "Daily activities", "Physiotherapy on site"],
  },
  {
    id: "denderhof",
    name: "Residentie Denderhof",
    city: "Aalst",
    region: "Aalst",
    distanceKm: 1.4,
    priceMin: 82,
    priceMax: 96,
    types: ["Residential", "Assisted living"],
    availability: { free: true, text: "2 assisted living flats free" },
    description: "A modern residence on the river Dender, with assisted living flats for people who are still fairly independent.",
    features: ["Restaurant", "Fitness room", "View of the Dender"],
  },
  {
    id: "sint-vincentius",
    name: "Sint-Vincentius",
    city: "Denderleeuw",
    region: "Aalst",
    distanceKm: 7.9,
    priceMin: 65,
    priceMax: 74,
    types: ["Residential", "Short stay", "Dementia care"],
    availability: { free: true, text: "Short stay: place free" },
    description: "A care home with a short-stay unit, a good way to get to know it first.",
    features: ["Short stay from 1 week", "Sensory garden", "Chapel"],
  },
  {
    id: "moorsel",
    name: "Zorgcampus Moorsel",
    city: "Moorsel",
    region: "Aalst",
    distanceKm: 5.6,
    priceMin: 70,
    priceMax: 84,
    types: ["Residential", "Day care", "Dementia care"],
    availability: { free: false, text: "Waiting list about 2 months" },
    description: "A green campus with day care and a specialised dementia care unit.",
    features: ["Large garden", "Day care", "GP on campus"],
  },
  {
    id: "rozenhof",
    name: "Het Rozenhof",
    city: "Sint-Amandsberg",
    region: "Ghent",
    distanceKm: 1.1,
    priceMin: 66,
    priceMax: 78,
    types: ["Residential", "Short stay"],
    availability: { free: true, text: "Short stay: place free" },
    description: "Close to Maria's house. A short stay is possible after a hospital stay.",
    features: ["Private bathroom", "Restaurant", "Visitors always welcome"],
  },
  {
    id: "ter-leie",
    name: "Ter Leie",
    city: "Ghent",
    region: "Ghent",
    distanceKm: 3.2,
    priceMin: 71,
    priceMax: 85,
    types: ["Residential", "Dementia care", "Day care"],
    availability: { free: false, text: "Waiting list about 3 months" },
    description: "On the river Leie, with a dementia care unit and day care.",
    features: ["Waterside view", "Cafeteria", "Day care"],
  },
  {
    id: "spiegel",
    name: "De Spiegel assisted living",
    city: "Gentbrugge",
    region: "Ghent",
    distanceKm: 2.7,
    priceMin: 58,
    priceMax: 69,
    types: ["Assisted living"],
    availability: { free: true, text: "1 flat free" },
    description: "Live independently, with care close by when needed.",
    features: ["Own kitchen", "Personal alarm", "Shared garden"],
  },
];

/** Possessive pronoun for an elder ("her" Mantel, "his" Mantel). */
export const poss = (elder: ElderId) => (elder === "maria" ? "her" : "his");
/** Subject pronoun for an elder. */
export const subj = (elder: ElderId) => (elder === "maria" ? "she" : "he");
