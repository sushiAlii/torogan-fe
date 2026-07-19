"use client";

import Link from "next/link";
import { Lock, ShieldCheck, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useGetProperty } from "@/hooks/properties/useGetProperty";

// Auth-gated island: the server-rendered listing page can only fetch
// public data (see lib/api/listing-data.ts for why — no reliable way to
// know a visitor is signed in server-side), so this client component
// re-fetches the property itself once authenticated to reveal
// ownerContact, which the backend only populates for authenticated
// requests. Anonymous visitors and crawlers never trigger this fetch.
export function ListingContactCard({ propertyId }: { propertyId: string }) {
  const { status: authStatus } = useAuth();
  const enabled = authStatus === "authenticated";
  const { data: property } = useGetProperty(propertyId, { enabled });

  const hasContact = Boolean(
    property?.ownerContact &&
    (property.ownerContact.name ||
      property.ownerContact.email ||
      property.ownerContact.phone),
  );

  if (authStatus === "authenticated" && hasContact) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-semibold text-foreground">
          Landlord contact info
        </h2>
        <div className="mt-4 space-y-3">
          {property?.ownerContact?.name && (
            <p className="font-medium text-foreground">
              {property.ownerContact.name}
            </p>
          )}
          {property?.ownerContact?.phone && (
            <a
              href={`tel:${property.ownerContact.phone}`}
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Phone className="size-4" aria-hidden="true" />
              {property.ownerContact.phone}
            </a>
          )}
          {property?.ownerContact?.email && (
            <a
              href={`mailto:${property.ownerContact.email}`}
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="size-4" aria-hidden="true" />
              {property.ownerContact.email}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Lock className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">
            Landlord contact info
          </h2>
          <p className="text-sm text-muted-foreground">
            Phone &amp; email are hidden
          </p>
        </div>
      </div>

      {/* Blurred fake info to hint at content */}
      <div aria-hidden="true" className="mt-4 space-y-2 select-none blur-sm">
        <p className="font-medium text-foreground">Jane Doe</p>
        <p className="text-muted-foreground">+1 (•••) •••-••••</p>
        <p className="text-muted-foreground">hidden@gmail.com</p>
      </div>

      <p className="mt-4 text-center text-sm font-medium text-foreground">
        Sign in to view contact info
      </p>
      <Button
        size="lg"
        className="mt-3 w-full"
        nativeButton={false}
        render={<Link href="/sign-in" />}
      >
        Sign in to view contact
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Free account — verified renters only
      </p>
    </div>
  );
}
