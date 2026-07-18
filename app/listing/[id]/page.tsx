'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Lock,
  ShieldCheck,
  Loader2,
  Phone,
  Mail,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { ImageGallery } from '@/components/image-gallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth/auth-context'
import { propertyClient, addressClient } from '@/lib/api/client'
import { formatPrice } from '@/lib/format'
import type { Property } from '@/lib/gen/property_pb'
import type { Address } from '@/lib/gen/address_pb'

export default function ListingPage() {
  const { id } = useParams<{ id: string }>()
  const { status: authStatus } = useAuth()

  const [property, setProperty] = useState<Property | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (authStatus === 'loading') return

    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const p = await propertyClient.getPropertyByID({ id })
        if (cancelled) return
        setProperty(p)
        setNotFound(false)
      } catch {
        if (!cancelled) setNotFound(true)
        return
      }

      try {
        const a = await addressClient.getAddressByPropertyID({ propertyId: id })
        if (!cancelled) setAddress(a)
      } catch {
        if (!cancelled) setAddress(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, authStatus])

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
    )
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-foreground">Listing not found</h1>
          <p className="mt-2 text-muted-foreground">
            This listing may have been removed or never existed.
          </p>
          <Button className="mt-6" nativeButton={false} render={<Link href="/" />}>
            Back to listings
          </Button>
        </div>
      </div>
    )
  }

  const images = property.images.length > 0
    ? property.images
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((img) => img.url)
    : property.mainImageUrl
      ? [property.mainImageUrl]
      : ['/placeholder.svg']

  const location = address ? `${address.city}, ${address.state}` : null

  const stats = [
    { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms },
    { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
    { icon: Maximize, label: 'm²', value: property.sizeSqM.toLocaleString() },
  ]

  const hasContact = Boolean(
    property.ownerContact && (property.ownerContact.name || property.ownerContact.email || property.ownerContact.phone),
  )

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* Left: gallery */}
          <div>
            <ImageGallery images={images} title={property.title} />
          </div>

          {/* Right: details */}
          <div className="flex flex-col gap-5">
            <div>
              <Badge variant="secondary" className="mb-3">
                {property.type}
              </Badge>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight text-foreground">
                  {formatPrice(property.price)}
                </span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <h1 className="mt-2 text-pretty text-2xl font-semibold leading-tight text-foreground">
                {property.title}
              </h1>
              {location && (
                <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-4" aria-hidden="true" />
                  {location}
                </p>
              )}
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center text-center">
                  <s.icon className="size-5 text-primary" aria-hidden="true" />
                  <span className="mt-1.5 font-semibold text-foreground">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Contact card */}
            {authStatus === 'authenticated' && hasContact ? (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-semibold text-foreground">Landlord contact info</h2>
                <div className="mt-4 space-y-3">
                  {property.ownerContact?.name && (
                    <p className="font-medium text-foreground">{property.ownerContact.name}</p>
                  )}
                  {property.ownerContact?.phone && (
                    <a
                      href={`tel:${property.ownerContact.phone}`}
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Phone className="size-4" aria-hidden="true" />
                      {property.ownerContact.phone}
                    </a>
                  )}
                  {property.ownerContact?.email && (
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
            ) : (
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
                <div
                  aria-hidden="true"
                  className="mt-4 space-y-2 select-none blur-sm"
                >
                  <p className="font-medium text-foreground">Jane Doe</p>
                  <p className="text-muted-foreground">+1 (•••) •••-••••</p>
                  <p className="text-muted-foreground">hidden@nestlee.com</p>
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
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold text-foreground">About this home</h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              {property.description || 'No description provided.'}
            </p>
          </div>

          {address && (
            <div>
              <h2 className="text-xl font-semibold text-foreground">Address</h2>
              <Separator className="my-3" />
              <p className="text-sm text-foreground">
                {address.streetAddress}
                {address.extendedAddress ? `, ${address.extendedAddress}` : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.state} {address.countryCode}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
