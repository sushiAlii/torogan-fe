import 'server-only'
import { cache } from 'react'
import { ConnectError, Code } from '@connectrpc/connect'

import { serverPropertyClient, serverAddressClient } from '@/lib/api/server-client'
import type { Property } from '@/lib/gen/property_pb'
import type { Address } from '@/lib/gen/address_pb'
import type { Feature } from '@/lib/gen/feature_pb'

export type ListingData = {
  property: Property
  address: Address | null
  features: Feature[]
}

// Wrapped in React's cache() (not Next's fetch memoization, which can't
// span an arbitrary RPC transport) so generateMetadata and the page body
// share one set of network calls per request instead of fetching twice.
export const getListingData = cache(async (id: string): Promise<ListingData | null> => {
  let property: Property
  try {
    property = await serverPropertyClient.getPropertyByID({ id })
  } catch (err) {
    if (err instanceof ConnectError && err.code === Code.NotFound) {
      return null
    }
    throw err
  }

  // Address/features are secondary — a hiccup fetching either shouldn't
  // 404 or 500 the whole listing page, matching how the page already
  // tolerates missing address/features today.
  const [address, featuresRes] = await Promise.all([
    serverAddressClient.getAddressByPropertyID({ propertyId: id }).catch(() => null),
    serverPropertyClient.listPropertyFeatures({ propertyId: id }).catch(() => null),
  ])

  return { property, address, features: featuresRes?.features ?? [] }
})
