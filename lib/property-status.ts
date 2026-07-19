import type { Timestamp } from '@bufbuild/protobuf/wkt'
import { timestampDate } from '@bufbuild/protobuf/wkt'
import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '@/components/ui/badge'

export const PROPERTY_STATUSES = ['active', 'expired', 'rented'] as const
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number]

/** The wire `status` field is a plain `string` (protoc-gen-es doesn't type
 * proto string fields as unions), so this is the one narrowing point —
 * a real runtime-checked predicate, not a type assertion. */
export function isPropertyStatus(status: string): status is PropertyStatus {
  return (PROPERTY_STATUSES as readonly string[]).includes(status)
}

const STATUS_LABELS: Record<PropertyStatus, string> = {
  active: 'Active',
  expired: 'Expired',
  rented: 'Rented',
}

export function statusLabel(status: PropertyStatus): string {
  return STATUS_LABELS[status]
}

const STATUS_BADGE_VARIANTS: Record<PropertyStatus, VariantProps<typeof badgeVariants>['variant']> = {
  active: 'default',
  expired: 'outline',
  rented: 'secondary',
}

export function statusBadgeVariant(status: PropertyStatus): VariantProps<typeof badgeVariants>['variant'] {
  return STATUS_BADGE_VARIANTS[status]
}

/** Days remaining until ts (positive), or days since it passed (negative).
 * Rounds toward the present in both directions. */
export function daysUntil(ts: Timestamp | undefined): number {
  if (!ts) return 0
  const diffMs = timestampDate(ts).getTime() - Date.now()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/** Human-readable expiry text for a listing card. */
export function expiryText(ts: Timestamp | undefined): string {
  const days = daysUntil(ts)
  if (days > 1) return `Expires in ${days} days`
  if (days === 1) return 'Expires tomorrow'
  if (days === 0) return 'Expires today'
  if (days === -1) return 'Expired yesterday'
  return `Expired ${Math.abs(days)} days ago`
}

/** Human-readable "deleted N days ago" text for the Deleted tab, based on deletedAt. */
export function deletedText(ts: Timestamp | undefined): string {
  if (!ts) return 'Deleted'
  const daysAgo = Math.abs(daysUntil(ts))
  if (daysAgo === 0) return 'Deleted today'
  if (daysAgo === 1) return 'Deleted yesterday'
  return `Deleted ${daysAgo} days ago`
}
