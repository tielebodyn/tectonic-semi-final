"use client";

import { AuditLog } from "@/components/audit-log";
import { useCurrent } from "@/lib/use-current";
import { Card, LockedNotice } from "@/components/ui";

export default function LogPage() {
  const { s, elder, elderPerson, canView, link } = useCurrent();
  if (!link || !canView) {
    return <LockedNotice title="Geen toegang tot het logboek" body={`Met uw rol ziet u enkel meldingen voor ${elderPerson.firstName}.`} />;
  }
  return (
    <div>
      <h1 className="px-1 text-2xl font-bold tracking-tight">Logboek</h1>
      <p className="mt-1 px-1 text-sm text-muted">
        Alles wat er in de Mantel van {elderPerson.firstName} gebeurt. {elderPerson.firstName} ziet precies hetzelfde.
      </p>
      <Card className="mt-4 p-2">
        <AuditLog entries={s.audit[elder]} />
      </Card>
    </div>
  );
}
