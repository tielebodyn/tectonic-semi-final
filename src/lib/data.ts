import type { Bill, ElderId, Person, PersonId, Region, RoleId } from "./types";

/** The fixed "today" of the demo, so dummy dates always read naturally. */
export const DEMO_TODAY = "2026-10-20";

export const PEOPLE: Record<PersonId, Person> = {
  maria: { id: "maria", firstName: "Maria", lastName: "Peeters", age: 79, city: "Gent", isKbcCustomer: true, tone: "bg-rose-100 text-rose-800" },
  jozef: { id: "jozef", firstName: "Jozef", lastName: "Claes", age: 84, city: "Aalst", isKbcCustomer: true, tone: "bg-amber-100 text-amber-800" },
  sarah: { id: "sarah", firstName: "Sarah", lastName: "Peeters", age: 48, city: "Gent", isKbcCustomer: true, tone: "bg-sky-100 text-sky-800" },
  tom: { id: "tom", firstName: "Tom", lastName: "Peeters", age: 45, city: "Antwerpen", isKbcCustomer: false, tone: "bg-emerald-100 text-emerald-800" },
  ann: { id: "ann", firstName: "Ann", lastName: "Verhaeghe", age: 72, city: "Gent", isKbcCustomer: false, tone: "bg-violet-100 text-violet-800" },
  pieter: { id: "pieter", firstName: "Pieter", lastName: "Claes", age: 51, city: "Gent", isKbcCustomer: true, tone: "bg-indigo-100 text-indigo-800" },
  lieve: { id: "lieve", firstName: "Lieve", lastName: "Claes", age: 55, city: "Brussel", isKbcCustomer: false, tone: "bg-teal-100 text-teal-800" },
};

export const fullName = (id: PersonId) => `${PEOPLE[id].firstName} ${PEOPLE[id].lastName}`;
export const firstName = (id: PersonId) => PEOPLE[id].firstName;

export const ROLES: Record<RoleId, { label: string; short: string; can: string[]; cannot: string[] }> = {
  meldingen: {
    label: "Meldingen",
    short: "Krijgt enkel meldingen, volgens de regels van de ouder.",
    can: ["Meldingen ontvangen volgens de regels die de ouder koos"],
    cannot: ["Saldo's of vermogen zien", "Betalingen doen"],
  },
  inzage: {
    label: "Inzage",
    short: "Kan rekeningen, vermogen en zorgplan bekijken. Geen betalingen.",
    can: ["Rekeningen en vermogen bekijken", "Het zorgplan en signalen volgen", "Diensten aanvragen"],
    cannot: ["Betalingen of overschrijvingen doen"],
  },
  handelen: {
    label: "Handelen",
    short: "Kan rekeningen betalen binnen de limiet die de ouder instelde.",
    can: ["Alles van Inzage", "Rekeningen betalen binnen de limiet", "Het zorgbudget beheren"],
    cannot: ["Boven de limiet betalen zonder goedkeuring van de ouder"],
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
    region: "Gent",
    address: "Kasteellaan 112, 9000 Gent",
    living: "Woont alleen in haar eigen huis",
    careLevel: "Lichte zorgnood",
    careSummary: "Thuisverpleging 3× per week sinds september, na een korte ziekenhuisopname.",
    gp: "Dr. Van Damme",
    limit: 500,
    iban: "BE68 7340 1234 5678",
  },
  jozef: {
    id: "jozef",
    region: "Aalst",
    address: "Kerkstraat 18 bus 2, 9300 Aalst",
    living: "Woont alleen in een appartement",
    careLevel: "Zwaardere zorgnood",
    careSummary: "Dagelijkse thuisverpleging, gezinszorg en 2× per week dagverzorging. Op zoek naar een woonzorgcentrum.",
    gp: "Dr. De Wolf",
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
      name: "Eengezinswoning, Gent",
      detail: "2 verdiepingen · slaap- en badkamer boven · volledig afbetaald",
      value: 385000,
      note: "Schatting op basis van de KBC Woningwaarde-index (okt 2026)",
    },
    monthlyIncome: 1780,
    groups: [
      {
        title: "Rekeningen",
        items: [
          { name: "Zichtrekening", detail: "BE68 7340 1234 5678", value: 4230.55 },
          { name: "Spaarrekening", detail: "KBC Spaarrekening", value: 38900 },
        ],
      },
      {
        title: "Beleggingen",
        items: [
          { name: "Defensief gemengd fonds", detail: "Beleggingsportefeuille", value: 48200, trend: "+2,4% dit jaar" },
          { name: "Aandelenfonds Europa", detail: "Beleggingsportefeuille", value: 9750, trend: "+5,1% dit jaar" },
          { name: "KBC Groep aandelen", detail: "60 stuks", value: 4400, trend: "+8,0% dit jaar" },
        ],
      },
      {
        title: "Verzekeringen",
        items: [
          { name: "KBC Hospitalisatieverzekering", detail: "Hospital Care · ook nazorg tot 90 dagen na opname", note: "Sept: €1.840 terugbetaald" },
          { name: "KBC Woonverzekering", detail: "Woning Kasteellaan 112", note: "Actief" },
          { name: "Familiale verzekering", detail: "Burgerlijke aansprakelijkheid", note: "Actief" },
        ],
      },
      {
        title: "Kredieten",
        items: [{ name: "Geen lopende kredieten", detail: "Woonkrediet volledig afbetaald in 2014" }],
      },
    ],
  },
  jozef: {
    home: {
      name: "Appartement, Aalst",
      detail: "Gelijkvloers · lift in het gebouw · volledig afbetaald",
      value: 238000,
      note: "Schatting op basis van de KBC Woningwaarde-index (okt 2026)",
    },
    monthlyIncome: 1940,
    groups: [
      {
        title: "Rekeningen",
        items: [
          { name: "Zichtrekening", detail: "BE12 7350 9876 5432", value: 2870.1 },
          { name: "Spaarrekening", detail: "KBC Spaarrekening", value: 61300 },
        ],
      },
      {
        title: "Beleggingen",
        items: [{ name: "Defensief gemengd fonds", detail: "Beleggingsportefeuille", value: 22400, trend: "+2,1% dit jaar" }],
      },
      {
        title: "Verzekeringen",
        items: [
          { name: "KBC Hospitalisatieverzekering", detail: "Hospital Care", note: "Actief" },
          { name: "KBC Woonverzekering", detail: "Appartement Kerkstraat 18", note: "Actief" },
        ],
      },
      {
        title: "Kredieten",
        items: [{ name: "Geen lopende kredieten", detail: "" }],
      },
    ],
  },
};

/** Monthly care costs, last six months, in euro. */
export const CARE_COSTS: Record<ElderId, { month: string; nursing: number; pharmacy: number; help: number }[]> = {
  maria: [
    { month: "mei", nursing: 0, pharmacy: 22, help: 0 },
    { month: "jun", nursing: 0, pharmacy: 25, help: 0 },
    { month: "jul", nursing: 0, pharmacy: 24, help: 0 },
    { month: "aug", nursing: 0, pharmacy: 38, help: 0 },
    { month: "sep", nursing: 184.2, pharmacy: 61, help: 0 },
    { month: "okt", nursing: 184.2, pharmacy: 64.1, help: 0 },
  ],
  jozef: [
    { month: "mei", nursing: 198, pharmacy: 71, help: 248 },
    { month: "jun", nursing: 205, pharmacy: 69, help: 260 },
    { month: "jul", nursing: 214, pharmacy: 74, help: 286 },
    { month: "aug", nursing: 228, pharmacy: 78, help: 312 },
    { month: "sep", nursing: 236, pharmacy: 81, help: 492 },
    { month: "okt", nursing: 236, pharmacy: 83, help: 492 },
  ],
};

export const RECURRING: Record<ElderId, { name: string; detail: string; amount: number }[]> = {
  maria: [
    { name: "Wit-Gele Kruis", detail: "Thuisverpleging · sinds sept", amount: 184.2 },
    { name: "Apotheek De Brug", detail: "Medicatie", amount: 64.1 },
  ],
  jozef: [
    { name: "Wit-Gele Kruis", detail: "Dagelijkse thuisverpleging", amount: 236 },
    { name: "Familiehulp", detail: "Gezinszorg 6 u/week", amount: 312 },
    { name: "Dagverzorging Den Bogaard", detail: "2× per week", amount: 180 },
    { name: "Apotheek", detail: "Medicatie", amount: 83 },
  ],
};

// ---------------------------------------------------------------------------
// Bills

export const INITIAL_BILLS: Record<ElderId, Bill[]> = {
  maria: [
    { id: "wgk-okt", payee: "Wit-Gele Kruis Oost-Vlaanderen", description: "Thuisverpleging oktober", amount: 184.2, due: "2026-10-28", iban: "BE21 4420 0000 1203", reference: "+++090/2610/48213+++", status: "open" },
    { id: "apo-okt", payee: "Apotheek De Brug", description: "Medicatie oktober", amount: 64.1, due: "2026-10-31", iban: "BE55 0016 2203 4471", reference: "Factuur 2026-1088", status: "open" },
    { id: "ketel", payee: "Verwarming De Pauw", description: "Herstelling verwarmingsketel", amount: 742, due: "2026-11-04", iban: "BE90 7370 1122 3344", reference: "+++112/0045/77801+++", status: "open" },
  ],
  jozef: [
    { id: "fh-okt", payee: "Familiehulp", description: "Gezinszorg oktober", amount: 312, due: "2026-10-30", iban: "BE33 7995 1234 0001", reference: "+++200/1026/33019+++", status: "open" },
    { id: "dv-okt", payee: "Dagverzorging Den Bogaard", description: "Dagverzorging oktober", amount: 180, due: "2026-11-02", iban: "BE77 0689 4410 2290", reference: "Factuur DB-2026-341", status: "open" },
  ],
};

// ---------------------------------------------------------------------------
// Tasks (care checklist)

export const TASKS: Record<ElderId, { id: string; title: string; detail: string }[]> = {
  maria: [
    { id: "t-bill", title: "Factuur Wit-Gele Kruis betalen", detail: "Vervalt op 28 oktober" },
    { id: "t-zorgbudget", title: "Zorgbudget voor ouderen aanvragen", detail: "Via de zorgkas · tot ca. €140 per maand" },
    { id: "t-volmacht", title: "Zorgvolmacht bespreken met mama", detail: "Rustig, op haar tempo" },
    { id: "t-traplift", title: "Offerte traplift bekijken", detail: "Slaapkamer ligt boven" },
  ],
  jozef: [
    { id: "j-bezoek", title: "Bezoek WZC Hof ter Linden", detail: "Samen met Pieter, zaterdag" },
    { id: "j-wachtlijst", title: "Wachtlijst De Kastanjelaar opvolgen", detail: "Positie 6 · ca. 4 maanden" },
    { id: "j-budget", title: "Zorgbudget zwaar zorgbehoevenden", detail: "Aanvraag loopt bij de zorgkas" },
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
    title: "Maria betaalt sinds 2 maanden voor thuisverpleging",
    body: "Wilt u bekijken welke ondersteuning mogelijk is? Er bestaat bijvoorbeeld een zorgbudget voor ouderen met een zorgnood.",
    reason: ["Sinds september gaat er elke maand €184,20 naar Wit-Gele Kruis.", "Een vaste betaling voor thuisverpleging wijst vaak op een (tijdelijke) zorgnood."],
    cta: { label: "Bekijk ondersteuning", href: "/app/diensten" },
    date: "2026-10-18",
  },
  {
    id: "s-stairs",
    elder: "maria",
    icon: "stairs",
    title: "Maria's slaap- en badkamer liggen boven",
    body: "Een traplift kan haar helpen om langer en veilig thuis te wonen. Met een KBC Renovatielening spreidt u de kost.",
    reason: ["Uit de gegevens van haar woonverzekering: een woning met 2 verdiepingen.", "Na een ziekenhuisopname wordt de trap vaak een obstakel."],
    cta: { label: "Bekijk woningaanpassingen", href: "/app/diensten" },
    date: "2026-10-17",
  },
  {
    id: "s-pharm",
    elder: "maria",
    icon: "pill",
    title: "De apotheekkosten van Maria zijn gestegen",
    body: "Medicatie aan huis laten leveren kan haar verplaatsingen besparen.",
    reason: ["Tot juli gemiddeld €24 per maand, nu €64 per maand."],
    cta: { label: "Bekijk thuislevering", href: "/app/diensten" },
    date: "2026-10-15",
  },
  {
    id: "s-food",
    elder: "maria",
    icon: "cart",
    title: "Maria doet minder boodschappen dan vroeger",
    body: "Misschien is koken of winkelen wat lastiger geworden. Een warme maaltijd aan huis kan helpen.",
    reason: ["Het aantal betalingen in de supermarkt daalde van ongeveer 9 naar 3 per maand."],
    cta: { label: "Bekijk maaltijden aan huis", href: "/app/diensten" },
    date: "2026-10-12",
  },
  {
    id: "s-hosp",
    elder: "maria",
    icon: "hospital",
    title: "De hospitalisatieverzekering betaalde €1.840 terug",
    body: "Ook nazorg thuis tot 90 dagen na de opname kan gedekt zijn. Bewaar de facturen van de thuisverpleging.",
    reason: ["In september was er een opname in AZ Sint-Lucas.", "Maria heeft KBC Hospital Care."],
    cta: { label: "Bekijk verzekeringen", href: "/app/vermogen" },
    date: "2026-09-29",
  },
  {
    id: "s-volmacht",
    elder: "maria",
    icon: "scroll",
    title: "Er is nog geen zorgvolmacht",
    body: "Met een zorgvolmacht kiest Maria nu zelf wie later haar zaken mag regelen, mocht ze dat ooit niet meer kunnen.",
    reason: ["We vonden geen geregistreerde zorgvolmacht bij KBC.", "Veel families regelen dit graag op een rustig moment."],
    cta: { label: "Bekijk notarissen", href: "/app/diensten" },
    date: "2026-10-10",
  },
  {
    id: "j-wait",
    elder: "jozef",
    icon: "home",
    title: "Jozef staat op 1 wachtlijst voor een woonzorgcentrum",
    body: "Bij WZC Hof ter Linden komt in november een kamer vrij. Wilt u een bezoek plannen?",
    reason: ["Jozef staat op positie 6 bij De Kastanjelaar.", "Hof ter Linden ligt op 2,1 km en past in zijn budget."],
    cta: { label: "Bekijk woonzorgcentra", href: "/app/diensten/woonzorg" },
    date: "2026-10-19",
  },
  {
    id: "j-short",
    elder: "jozef",
    icon: "bed",
    title: "Kortverblijf kan de overgang zachter maken",
    body: "Een paar weken kortverblijf laat Jozef kennismaken met een woonzorgcentrum, en geeft de familie even rust.",
    reason: ["De zorgkosten van Jozef stegen in september met ongeveer €180.", "Kortverblijf is mogelijk in 2 centra in de buurt."],
    cta: { label: "Zoek kortverblijf", href: "/app/diensten/woonzorg" },
    date: "2026-10-14",
  },
  {
    id: "j-budget",
    elder: "jozef",
    icon: "euro",
    title: "Jozef kan recht hebben op het zorgbudget voor zwaar zorgbehoevenden",
    body: "Dat is een vast maandelijks bedrag van de Vlaamse sociale bescherming. De aanvraag loopt via de zorgkas.",
    reason: ["Er zijn vaste betalingen voor thuisverpleging, gezinszorg en dagverzorging."],
    cta: { label: "Bekijk zorgkosten", href: "/app/vermogen" },
    date: "2026-10-08",
  },
];

// ---------------------------------------------------------------------------
// Partner services

export type ServiceCategory = "thuiszorg" | "apotheek" | "veiligheid" | "maaltijden" | "woning" | "woonzorg" | "juridisch";

export const CATEGORIES: { id: ServiceCategory | "alles"; label: string }[] = [
  { id: "alles", label: "Alles" },
  { id: "thuiszorg", label: "Zorg thuis" },
  { id: "woning", label: "Woning aanpassen" },
  { id: "apotheek", label: "Apotheek" },
  { id: "maaltijden", label: "Maaltijden" },
  { id: "veiligheid", label: "Veiligheid" },
  { id: "woonzorg", label: "Woonzorgcentra" },
  { id: "juridisch", label: "Juridisch" },
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
  shares: string;
  loan?: { amount: number; months: number; monthly: number; rate: string };
  monogram: string;
  tone: string;
};

export const SERVICES: Service[] = [
  {
    id: "wgk",
    partner: "Wit-Gele Kruis",
    name: "Thuisverpleging & ergotherapeut aan huis",
    category: "thuiszorg",
    regions: ["Gent", "Aalst"],
    description: "Uitbreiding van de thuisverpleging en een huisbezoek van een ergotherapeut die bekijkt hoe de woning veiliger en comfortabeler kan.",
    price: "Thuisverpleging met voorschrift: meestal volledig terugbetaald. Huisbezoek ergotherapeut: gratis.",
    why: {
      maria: "Maria krijgt al thuisverpleging en haar slaapkamer ligt boven. Een ergotherapeut kijkt mee wat er nodig is.",
      jozef: "Jozef krijgt dagelijks thuisverpleging. Een zorgplan helpt bij de overgang naar een woonzorgcentrum.",
    },
    generic: "Thuisverpleging bij u in de buurt.",
    kbc: { product: "KBC Hospitalisatieverzekering", detail: "Nazorg tot 90 dagen na opname kan gedekt zijn" },
    cta: "Aanvragen",
    confirm: "Wit-Gele Kruis belt u binnen 2 werkdagen om een huisbezoek te plannen.",
    shares: "naam, adres en telefoonnummer van de ouder, en uw contactgegevens",
    monogram: "WGK",
    tone: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    id: "traplift",
    partner: "Traplift Vlaanderen",
    name: "Traplift op maat",
    category: "woning",
    regions: ["Gent", "Aalst"],
    description: "Gratis opmeting aan huis en een offerte voor een rechte of bochtige traplift. Plaatsing binnen 3 weken.",
    price: "€4.500 – €8.500 · Vlaamse aanpassingspremie mogelijk",
    why: { maria: "Maria's slaap- en badkamer liggen boven. Met een traplift blijft het hele huis bereikbaar." },
    generic: "Om de trap veilig te blijven nemen.",
    kbc: { product: "KBC Renovatielening", detail: "Spreid de kost, bv. €6.800 over 5 jaar" },
    loan: { amount: 6800, months: 60, monthly: 125.4, rate: "4,15% JKP (indicatief)" },
    cta: "Offerte aanvragen",
    confirm: "Traplift Vlaanderen plant de gratis opmeting en bezorgt een offerte binnen 5 werkdagen.",
    shares: "naam en adres van de ouder, en uw contactgegevens",
    monogram: "TV",
    tone: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  {
    id: "farmaline",
    partner: "Farmaline",
    name: "Online apotheek met thuislevering",
    category: "apotheek",
    regions: ["Gent", "Aalst"],
    description: "Voorschriften en medicatie aan huis geleverd, met een herinnering wanneer het tijd is om aan te vullen.",
    price: "Gratis levering vanaf €39",
    why: {
      maria: "De apotheekkosten van Maria stegen van €24 naar €64 per maand. Thuislevering bespaart haar verplaatsingen.",
      jozef: "Jozef neemt dagelijks medicatie. Thuislevering ontlast Pieter.",
    },
    generic: "Medicatie aan huis.",
    kbc: { product: "KBC-domiciliëring", detail: "Automatisch betalen vanaf de rekening van de ouder" },
    cta: "Aanvragen",
    confirm: "Farmaline stuurt een bevestiging en de eerste levering kan al morgen.",
    shares: "naam en leveradres van de ouder",
    monogram: "F",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    id: "familiehulp",
    partner: "Familiehulp",
    name: "Gezinszorg & poetshulp",
    category: "thuiszorg",
    regions: ["Gent", "Aalst"],
    description: "Hulp bij het huishouden, boodschappen en persoonlijke verzorging, door een vaste verzorgende.",
    price: "€4 – €15 per uur, afhankelijk van het inkomen",
    why: { maria: "Minder supermarktbetalingen en een recente opname: hulp bij boodschappen en huishouden kan ontlasten." },
    generic: "Vaste hulp in het huishouden.",
    cta: "Aanvragen",
    confirm: "Een maatschappelijk werker van Familiehulp komt langs voor een kennismaking.",
    shares: "naam, adres en telefoonnummer van de ouder",
    monogram: "FH",
    tone: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  {
    id: "maaltijden",
    partner: "Smakelijk Thuis",
    name: "Warme maaltijden aan huis",
    category: "maaltijden",
    regions: ["Gent", "Aalst"],
    description: "Een gezonde warme maaltijd, elke middag of enkele dagen per week, aangepast aan dieetwensen.",
    price: "€9,50 per maaltijd",
    why: { maria: "Maria doet minder boodschappen dan vroeger. Een warme maaltijd zorgt voor een vast moment per dag." },
    generic: "Een warme maaltijd, zonder zorgen.",
    cta: "Aanvragen",
    confirm: "Smakelijk Thuis belt om de dagen en het menu af te spreken.",
    shares: "naam en adres van de ouder",
    monogram: "ST",
    tone: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  {
    id: "alarm",
    partner: "Vitas Personenalarm",
    name: "Personenalarm 24/7",
    category: "veiligheid",
    regions: ["Gent", "Aalst"],
    description: "Een knop om de hals of pols. Met één druk is er dag en nacht iemand die luistert en hulp stuurt.",
    price: "€19,50 per maand",
    why: { maria: "Maria woont alleen. Een personenalarm geeft haar en de familie rust." },
    generic: "Hulp met één druk op de knop.",
    kbc: { product: "KBC Woonverzekering", detail: "€5 per maand korting voor klanten" },
    cta: "Aanvragen",
    confirm: "Vitas installeert het alarm binnen de week.",
    shares: "naam, adres en noodcontacten van de ouder",
    monogram: "V",
    tone: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  {
    id: "badkamer",
    partner: "Badkamer Zorgeloos",
    name: "Inloopdouche & aangepaste badkamer",
    category: "woning",
    regions: ["Gent", "Aalst"],
    description: "Een veilige badkamer met inloopdouche, beugels en antislip. Ook op het gelijkvloers mogelijk.",
    price: "€7.000 – €14.000 · aanpassingspremie mogelijk",
    why: { maria: "De badkamer ligt boven. Een douche beneden kan een alternatief zijn voor een traplift." },
    generic: "Veilig douchen, zonder drempels.",
    kbc: { product: "KBC Renovatielening", detail: "Spreid de kost over 2 tot 10 jaar" },
    loan: { amount: 10000, months: 84, monthly: 137.2, rate: "4,15% JKP (indicatief)" },
    cta: "Offerte aanvragen",
    confirm: "Badkamer Zorgeloos plant een gratis adviesbezoek.",
    shares: "naam en adres van de ouder",
    monogram: "BZ",
    tone: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  {
    id: "notaris-gent",
    partner: "Notaris Van den Berghe",
    name: "Zorgvolmacht opstellen",
    category: "juridisch",
    regions: ["Gent"],
    description: "Een rustig gesprek, thuis of op kantoor. De ouder kiest zelf wie later haar zaken mag regelen.",
    price: "ca. €250 – €350, registratie inbegrepen",
    why: { maria: "Er is nog geen zorgvolmacht. Zo beslist Maria zelf, nu het nog kan." },
    generic: "Zelf beslissen wie later helpt.",
    kbc: { product: "KBC Infosessie Zorgvolmacht", detail: "Gratis, online of in uw kantoor" },
    cta: "Afspraak aanvragen",
    confirm: "Het kantoor van notaris Van den Berghe belt om een afspraak te maken.",
    shares: "naam en telefoonnummer van de ouder",
    monogram: "N",
    tone: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  {
    id: "notaris-aalst",
    partner: "Notaris De Clercq",
    name: "Zorgvolmacht opstellen",
    category: "juridisch",
    regions: ["Aalst"],
    description: "Een rustig gesprek, thuis of op kantoor. De ouder kiest zelf wie later zijn zaken mag regelen.",
    price: "ca. €250 – €350, registratie inbegrepen",
    why: { jozef: "Voor Jozef is er al een zorgvolmacht voor Pieter. Een update kan nodig zijn bij een verhuis." },
    generic: "Zelf beslissen wie later helpt.",
    kbc: { product: "KBC Infosessie Zorgvolmacht", detail: "Gratis, online of in uw kantoor" },
    cta: "Afspraak aanvragen",
    confirm: "Het kantoor van notaris De Clercq belt om een afspraak te maken.",
    shares: "naam en telefoonnummer van de ouder",
    monogram: "N",
    tone: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  {
    id: "dagverzorging",
    partner: "Den Bogaard",
    name: "Extra dag dagverzorging",
    category: "thuiszorg",
    regions: ["Aalst"],
    description: "Een gezellige dag in een dagverzorgingscentrum, met vervoer van en naar huis.",
    price: "€30 per dag, vervoer inbegrepen",
    why: { jozef: "Jozef gaat er al 2× per week heen. Een derde dag geeft Pieter extra ademruimte." },
    generic: "Een dag gezelschap en zorg.",
    cta: "Aanvragen",
    confirm: "Den Bogaard bevestigt de extra dag binnen 1 werkdag.",
    shares: "naam van de ouder",
    monogram: "DB",
    tone: "bg-lime-50 text-lime-700 ring-lime-200",
  },
];

// ---------------------------------------------------------------------------
// Care homes

export type CareType = "Residentieel" | "Kortverblijf" | "Dagverzorging" | "Assistentiewoning" | "Dementiezorg";

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
    name: "WZC Hof ter Linden",
    city: "Aalst",
    region: "Aalst",
    distanceKm: 2.1,
    priceMin: 68,
    priceMax: 79,
    types: ["Residentieel", "Kortverblijf", "Dementiezorg"],
    availability: { free: true, text: "1 kamer vrij vanaf november" },
    description: "Kleinschalig woonzorgcentrum met een grote tuin, op wandelafstand van het centrum van Aalst.",
    features: ["Eigen badkamer", "Tuin met moestuin", "Kapsalon", "Huisdieren welkom"],
  },
  {
    id: "kastanjelaar",
    name: "WZC De Kastanjelaar",
    city: "Erembodegem",
    region: "Aalst",
    distanceKm: 4.8,
    priceMin: 62,
    priceMax: 71,
    types: ["Residentieel", "Dagverzorging"],
    availability: { free: false, text: "Wachtlijst ca. 4 maanden" },
    description: "Rustig gelegen centrum met een warme, familiale sfeer en veel activiteiten.",
    features: ["Cafetaria", "Dagelijkse activiteiten", "Kinesitherapie ter plaatse"],
  },
  {
    id: "denderhof",
    name: "Residentie Denderhof",
    city: "Aalst",
    region: "Aalst",
    distanceKm: 1.4,
    priceMin: 82,
    priceMax: 96,
    types: ["Residentieel", "Assistentiewoning"],
    availability: { free: true, text: "2 assistentiewoningen vrij" },
    description: "Moderne residentie aan de Dender, met assistentiewoningen voor wie nog vrij zelfstandig is.",
    features: ["Restaurant", "Fitnessruimte", "Zicht op de Dender"],
  },
  {
    id: "sint-vincentius",
    name: "WZC Sint-Vincentius",
    city: "Denderleeuw",
    region: "Aalst",
    distanceKm: 7.9,
    priceMin: 65,
    priceMax: 74,
    types: ["Residentieel", "Kortverblijf", "Dementiezorg"],
    availability: { free: true, text: "Kortverblijf: plaats vrij" },
    description: "Centrum met een afdeling voor kortverblijf, ideaal om eerst rustig kennis te maken.",
    features: ["Kortverblijf vanaf 1 week", "Belevingstuin", "Kapel"],
  },
  {
    id: "moorsel",
    name: "Zorgcampus Moorsel",
    city: "Moorsel",
    region: "Aalst",
    distanceKm: 5.6,
    priceMin: 70,
    priceMax: 84,
    types: ["Residentieel", "Dagverzorging", "Dementiezorg"],
    availability: { free: false, text: "Wachtlijst ca. 2 maanden" },
    description: "Groene campus met dagverzorging en een gespecialiseerde afdeling dementiezorg.",
    features: ["Grote tuin", "Dagverzorging", "Huisarts op de campus"],
  },
  {
    id: "rozenhof",
    name: "WZC Het Rozenhof",
    city: "Sint-Amandsberg",
    region: "Gent",
    distanceKm: 1.1,
    priceMin: 66,
    priceMax: 78,
    types: ["Residentieel", "Kortverblijf"],
    availability: { free: true, text: "Kortverblijf: plaats vrij" },
    description: "Vlakbij Maria's huis. Kortverblijf is mogelijk na een ziekenhuisopname.",
    features: ["Eigen badkamer", "Restaurant", "Bezoek altijd welkom"],
  },
  {
    id: "ter-leie",
    name: "WZC Ter Leie",
    city: "Gent",
    region: "Gent",
    distanceKm: 3.2,
    priceMin: 71,
    priceMax: 85,
    types: ["Residentieel", "Dementiezorg", "Dagverzorging"],
    availability: { free: false, text: "Wachtlijst ca. 3 maanden" },
    description: "Aan de Leie, met een afdeling dementiezorg en dagverzorging.",
    features: ["Zicht op het water", "Cafetaria", "Dagverzorging"],
  },
  {
    id: "spiegel",
    name: "Assistentiewoningen De Spiegel",
    city: "Gentbrugge",
    region: "Gent",
    distanceKm: 2.7,
    priceMin: 58,
    priceMax: 69,
    types: ["Assistentiewoning"],
    availability: { free: true, text: "1 woning vrij" },
    description: "Zelfstandig wonen, met zorg dichtbij als het nodig is.",
    features: ["Eigen keuken", "Personenalarm", "Gemeenschappelijke tuin"],
  },
];

/** Possessive pronoun for an elder ("haar" Mantel, "zijn" Mantel). */
export const poss = (elder: ElderId) => (elder === "maria" ? "haar" : "zijn");
/** Subject pronoun for an elder. */
export const subj = (elder: ElderId) => (elder === "maria" ? "zij" : "hij");
