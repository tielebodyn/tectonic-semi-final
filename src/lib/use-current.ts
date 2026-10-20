"use client";

import { ELDERS, PEOPLE } from "./data";
import { eldersFor, useDemo } from "./store";

/** The viewer, the elder whose Mantel is open, and the viewer's role for that elder. */
export function useCurrent() {
  const s = useDemo();
  const links = eldersFor(s, s.viewer);
  const link = links.find((l) => l.elder === s.activeElder) ?? links[0] ?? null;
  const elder = link?.elder ?? s.activeElder;
  const role = link?.state === "active" ? link.role : null;
  const member = s.circles[elder].find((m) => m.personId === s.viewer);
  return {
    s,
    viewer: s.viewer,
    viewerPerson: PEOPLE[s.viewer],
    links,
    link,
    elder,
    elderPerson: PEOPLE[elder],
    profile: ELDERS[elder],
    role,
    member,
    limit: s.limits[elder],
    canView: role === "inzage" || role === "handelen",
    canAct: role === "handelen",
  };
}
