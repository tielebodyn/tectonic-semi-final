"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { CATEGORIES, SERVICES, type ServiceCategory } from "@/lib/data";
import { useCurrent } from "@/lib/use-current";
import { ServiceCard } from "@/components/service-card";
import { Card, SectionTitle, cx } from "@/components/ui";

export default function ServicesPage() {
  const { elder, elderPerson, profile, link } = useCurrent();
  const [cat, setCat] = useState<ServiceCategory | "alles">("alles");
  const connected = link?.state === "active";

  const inRegion = SERVICES.filter((x) => x.regions.includes(profile.region));
  const filtered = cat === "alles" ? inRegion : inRegion.filter((x) => x.category === cat);
  const recommended = connected ? filtered.filter((x) => x.why[elder]) : [];
  const others = filtered.filter((x) => !recommended.includes(x));
  const showCareHomes = cat === "alles" || cat === "woonzorg";

  return (
    <div>
      <h1 className="px-1 text-2xl font-bold tracking-tight">Services</h1>
      <p className="mt-1 flex items-center gap-1 px-1 text-sm text-muted">
        <MapPin className="size-3.5" aria-hidden /> {connected ? `For ${elderPerson.firstName}, in the ${profile.region} area` : `All services in ${profile.region}`}
      </p>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={cx(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset transition-colors",
              cat === c.id ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-line hover:bg-brand-mist",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {showCareHomes && (
        <Link href="/app/diensten/woonzorg" className="mt-4 block">
          <Card className="flex items-center gap-3 bg-gradient-to-br from-white to-brand-mist">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white">
              <Building2 className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-ink">Care homes nearby</span>
              <span className="block text-sm text-muted">Availability, price and distance around {profile.region}</span>
            </span>
            <ArrowRight className="size-5 text-navy" aria-hidden />
          </Card>
        </Link>
      )}

      {recommended.length > 0 && (
        <>
          <SectionTitle>Recommended for {elderPerson.firstName}</SectionTitle>
          <div className="space-y-3">
            {recommended.map((x) => (
              <ServiceCard key={x.id} service={x} recommended />
            ))}
          </div>
        </>
      )}

      {others.length > 0 && (
        <>
          <SectionTitle>{recommended.length ? "Also nearby" : "Nearby"}</SectionTitle>
          <div className="space-y-3">
            {others.map((x) => (
              <ServiceCard key={x.id} service={x} recommended={false} />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && !showCareHomes && <p className="py-8 text-center text-sm text-muted">No services in this category in {profile.region}.</p>}
    </div>
  );
}
