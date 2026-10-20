export type ElderId = "maria" | "jozef";
export type PersonId = "maria" | "jozef" | "sarah" | "tom" | "ann" | "pieter" | "lieve";
export type RoleId = "meldingen" | "inzage" | "handelen";
export type Region = "Gent" | "Aalst";

export type Person = {
  id: PersonId;
  firstName: string;
  lastName: string;
  age: number;
  city: string;
  isKbcCustomer: boolean;
  /** Tailwind classes for the avatar circle */
  tone: string;
};

export type MemberStatus = "active" | "invited" | "revoked";

export type Member = {
  personId: PersonId;
  relation: string;
  role: RoleId;
  status: MemberStatus;
  /** ISO date */
  since: string;
  /** Joined via itsme without a KBC account */
  guest: boolean;
};

export type Rule = {
  id: string;
  /** "Als ..." part */
  condition: string;
  /** People who get notified */
  notify: PersonId[];
  active: boolean;
};

export type MantelStatus = "none" | "invited" | "active";

export type AuditEntry = {
  id: string;
  /** ISO datetime */
  at: string;
  actor: PersonId | "kbc";
  text: string;
  amount?: number;
  kind: "payment" | "request" | "access" | "alert" | "approval" | "view";
};

export type BillStatus = "open" | "paid" | "awaiting-approval" | "declined";

export type Bill = {
  id: string;
  payee: string;
  description: string;
  amount: number;
  /** ISO date */
  due: string;
  iban: string;
  reference: string;
  status: BillStatus;
};

export type Approval = {
  id: string;
  elder: ElderId;
  billId: string;
  requestedBy: PersonId;
  status: "pending" | "approved" | "declined";
};

export type FraudState = "none" | "alert" | "calling" | "blocking" | "resolved";

export type RequestedService = {
  serviceId: string;
  /** ISO datetime */
  at: string;
  by: PersonId;
  withLoan?: boolean;
};

export type PushNotification = {
  id: string;
  title: string;
  body: string;
  href?: string;
  tone?: "info" | "alert";
  /** Only this person sees the notification */
  for?: PersonId;
};
