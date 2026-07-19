'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { MyListingCard } from '@/components/my-listing-card'
import { useAuth } from '@/lib/auth/auth-context'
import { useGetMyProperties } from '@/hooks/properties/useGetMyProperties'
import { PROPERTY_STATUSES, isPropertyStatus, statusLabel, type PropertyStatus } from '@/lib/property-status'

type Tab = 'all' | PropertyStatus

const TABS: Tab[] = ['all', ...PROPERTY_STATUSES]

export default function MyListingsPage() {
  const router = useRouter()
  const { status } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const { data, isLoading } = useGetMyProperties({ enabled: status === 'authenticated' })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in')
    }
  }, [status, router])

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen">
        <SiteHeader />
      </div>
    )
  }

  const properties = data?.properties ?? []
  // Filtering happens here, client-side, against one unpaginated fetch —
  // see the comment on PropertyService.GetMyPropertyList in the backend.
  // If this list ever grows a cursor, filtering has to move server-side at
  // the same time, or a tab would only ever reflect whatever page happens
  // to be loaded.
  const filtered =
    activeTab === 'all' ? properties : properties.filter((p) => isPropertyStatus(p.status) && p.status === activeTab)

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">My listings</h1>
          <p className="mt-2 text-muted-foreground">Track expiry, mark units as rented, and renew listings.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer border-b-2 px-3 pb-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'all' ? 'All' : statusLabel(tab)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <MyListingCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <p className="font-medium text-foreground">No listings here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTab === 'all'
                ? "You haven't listed any properties yet."
                : `You have no ${statusLabel(activeTab).toLowerCase()} listings.`}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
