'use client'

import { useMemo, useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SearchBar } from '@/components/search-bar'
import { PropertyCard } from '@/components/property-card'
import { properties } from '@/lib/properties'

export default function BrowsePage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return properties
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Find a place you&apos;ll love to come home to
          </h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            Browse verified rentals and connect directly with landlords — no
            middlemen, no noise.
          </p>
          <div className="mt-6">
            <SearchBar value={query} onChange={setQuery} />
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">
              {filtered.length} {filtered.length === 1 ? 'home' : 'homes'} available
            </h2>
            <span className="text-sm text-muted-foreground">Sorted by featured</span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="font-medium text-foreground">No homes match your search</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different city or neighborhood.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
