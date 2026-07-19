'use client'

import Image from 'next/image'
import { formatPrice } from '@/lib/format'
import { deletedText } from '@/lib/property-status'
import { useRestoreProperty } from '@/hooks/properties/useRestoreProperty'
import { Button } from '@/components/ui/button'
import type { Property } from '@/lib/gen/property_pb'

// Lighter than MyListingCard on purpose: a deleted listing has no status
// badge, no Renew/Rent-toggle/Edit — just enough context to recognize it,
// plus Restore. No <Link> to the public listing page either, since
// GetPropertyByID resolves soft-deleted rows just fine but there's nothing
// useful to view mid-deletion.
export function DeletedListingCard({ property }: { property: Property }) {
  const restoreProperty = useRestoreProperty()

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card opacity-75 shadow-sm">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <Image
          src={property.mainImageUrl || '/placeholder.svg'}
          alt={property.title}
          className="size-full h-auto object-cover grayscale"
          width={0}
          height={0}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          {formatPrice(property.price)}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
        </span>

        <p className="text-pretty font-medium leading-snug text-foreground">{property.title}</p>

        <p className="text-sm text-muted-foreground">{deletedText(property.deletedAt)}</p>

        <div className="mt-auto pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={restoreProperty.isPending}
            onClick={() => restoreProperty.mutate({ id: property.id })}
          >
            {restoreProperty.isPending ? 'Restoring…' : 'Restore'}
          </Button>
        </div>
      </div>
    </div>
  )
}
