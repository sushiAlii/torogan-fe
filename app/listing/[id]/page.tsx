import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Check,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { ImageGallery } from '@/components/image-gallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getProperty, formatPrice } from '@/lib/properties'

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const property = getProperty(id)

  if (!property) {
    notFound()
  }

  const stats = [
    { icon: BedDouble, label: 'Bedrooms', value: property.beds },
    { icon: Bath, label: 'Bathrooms', value: property.baths },
    { icon: Maximize, label: 'Sq ft', value: property.area.toLocaleString() },
  ]

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
            <ImageGallery images={property.gallery} title={property.title} />
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
              <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4" aria-hidden="true" />
                {property.location}
              </p>
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

            {/* Locked contact card */}
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
                    Phone & email are hidden
                  </p>
                </div>
              </div>

              {/* Blurred fake info to hint at content */}
              <div
                aria-hidden="true"
                className="mt-4 space-y-2 select-none blur-sm"
              >
                <p className="font-medium text-foreground">{property.landlord.name}</p>
                <p className="text-muted-foreground">+1 (•••) •••-••••</p>
                <p className="text-muted-foreground">hidden@nestlee.com</p>
              </div>

              <p className="mt-4 text-center text-sm font-medium text-foreground">
                Register to View Contact Info
              </p>
              <Button
                size="lg"
                className="mt-3 w-full"
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                Register to view contact
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Free account — verified renters only
              </p>
            </div>
          </div>
        </div>

        {/* Description + features */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold text-foreground">About this home</h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">Features</h2>
            <Separator className="my-3" />
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {property.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-foreground">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
