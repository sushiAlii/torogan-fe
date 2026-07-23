import type { MetadataRoute } from 'next'
import { timestampDate } from '@bufbuild/protobuf/wkt'

import { serverPropertyClient } from '@/lib/api/server-client'
import { isPropertyStatus } from '@/lib/property-status'
import { SITE_URL } from '@/lib/site'

// Defensive cap on pagination — well beyond any realistic catalog size,
// just a backstop against an infinite loop if the backend ever misbehaves
// on cursor pagination.
const MAX_PAGES = 200
const PAGE_SIZE = 100

async function listActivePropertyEntries() {
  const entries: MetadataRoute.Sitemap = []
  let cursor = ''

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await serverPropertyClient.getPropertyList({
      cursor,
      limit: PAGE_SIZE,
      search: '',
    })

    for (const property of res.properties) {
      // Belt-and-suspenders: only list what's actually available, even if
      // the backend's list endpoint doesn't already filter this out.
      if (isPropertyStatus(property.status) && property.status !== 'active') continue

      entries.push({
        url: `${SITE_URL}/listing/${property.id}`,
        lastModified: property.updatedAt ? timestampDate(property.updatedAt) : undefined,
        changeFrequency: 'daily',
        priority: 0.8,
      })
    }

    if (!res.nextCursor) break
    cursor = res.nextCursor
  }

  return entries
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
  ]

  try {
    return [...staticRoutes, ...(await listActivePropertyEntries())]
  } catch {
    // A backend hiccup shouldn't take the whole sitemap down — degrade to
    // just the static routes rather than throwing (which would 500 the
    // /sitemap.xml crawlers depend on).
    return staticRoutes
  }
}
