'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BedDouble, Bath, Maximize } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RenewModal } from '@/components/renew-modal'
import { formatPrice } from '@/lib/format'
import { isPropertyStatus, statusLabel, statusBadgeVariant, expiryText } from '@/lib/property-status'
import { useMarkPropertyRented } from '@/hooks/properties/useMarkPropertyRented'
import { useMarkPropertyAvailable } from '@/hooks/properties/useMarkPropertyAvailable'
import type { Property } from '@/lib/gen/property_pb'

// Forked from PropertyCard rather than reused: that card is a single big
// <Link>, which can't host interactive buttons. Only the image/title link
// to the public listing page here.
export function MyListingCard({ property }: { property: Property }) {
  const [renewOpen, setRenewOpen] = useState(false)
  const markRented = useMarkPropertyRented()
  const markAvailable = useMarkPropertyAvailable()

  // property.status is a plain wire string — narrow it with the type
  // predicate rather than an assertion; fall back to "active" in the
  // (unexpected) case the server sends something outside the known set.
  const status = isPropertyStatus(property.status) ? property.status : 'active'

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Link href={`/listing/${property.id}`} className="group relative block aspect-4/3 overflow-hidden bg-muted">
        <Image
          src={property.mainImageUrl || '/placeholder.svg'}
          alt={property.title}
          className="size-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          width={0}
          height={0}
        />
        <Badge variant={statusBadgeVariant(status)} className="absolute left-3 top-3 shadow-sm backdrop-blur">
          {statusLabel(status)}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          {formatPrice(property.price)}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
        </span>

        <Link
          href={`/listing/${property.id}`}
          className="text-pretty font-medium leading-snug text-foreground hover:underline"
        >
          {property.title}
        </Link>

        <p className="text-sm text-muted-foreground">{expiryText(property.expiresAt)}</p>

        <div className="flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-4" aria-hidden="true" />
            {property.bedrooms} bd
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-4" aria-hidden="true" />
            {property.bathrooms} ba
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize className="size-4" aria-hidden="true" />
            {property.sizeSqM.toLocaleString()} m²
          </span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => setRenewOpen(true)}>
            Renew
          </Button>
          {status === 'rented' ? (
            <Button
              size="sm"
              variant="outline"
              disabled={markAvailable.isPending}
              onClick={() => markAvailable.mutate({ id: property.id })}
            >
              {markAvailable.isPending ? 'Updating…' : 'Mark as available'}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={markRented.isPending}
              onClick={() => markRented.mutate({ id: property.id })}
            >
              {markRented.isPending ? 'Updating…' : 'Mark as rented'}
            </Button>
          )}
        </div>
      </div>

      <RenewModal propertyId={property.id} open={renewOpen} onOpenChange={setRenewOpen} />
    </div>
  )
}
