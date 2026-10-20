"use client";

import { AuditLog } from "@/components/audit-log";
import { useCurrent } from "@/lib/use-current";
import { Card, LockedNotice } from "@/components/ui";

export default function LogPage() {
  const { s, elder, elderPerson, canView, link } = useCurrent();
  if (!link || !canView) {
    return <LockedNotice title="The activity log isn't shared with you" body={`With your role, you only get alerts about ${elderPerson.firstName}.`} />;
  }
  return (
    <div>
      <h1 className="px-1 text-2xl font-bold tracking-tight">Activity log</h1>
      <p className="mt-1 px-1 text-sm text-muted">
        Everything that happens in {elderPerson.firstName}&rsquo;s Mantel, newest first. {elderPerson.firstName} sees exactly the same list.
      </p>
      <Card className="mt-4 p-2">
        <AuditLog entries={s.audit[elder]} />
      </Card>
    </div>
  );
}
