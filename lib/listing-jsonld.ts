import type { ListingData } from '@/lib/api/listing-data'
import { SITE_URL } from '@/lib/site'

// dashboard/page.tsx and listing/[id]/edit/page.tsx both constrain this to
// the same fixed set — mirrored here rather than imported since neither
// exports it as a shared constant.
const PROPERTY_TYPE_TO_SCHEMA: Record<string, string> = {
  Apartment: 'Apartment',
  Studio: 'Apartment',
  House: 'House',
  Townhouse: 'House',
}

/** Builds schema.org JSON-LD for a listing detail page — lets search
 * engines show price/beds/location as rich results. Anonymous SSR only
 * fetches public fields (no ownerContact), so there's nothing sensitive to
 * guard against including here. */
export function buildListingJsonLd(data: ListingData, id: string, images: string[]) {
  const { property, address } = data
  const url = `${SITE_URL}/listing/${id}`

  return {
    '@context': 'https://schema.org',
    '@type': PROPERTY_TYPE_TO_SCHEMA[property.type] ?? 'Accommodation',
    name: property.title,
    description: property.description || undefined,
    url,
    image: images,
    numberOfBedroomsTotal: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.sizeSqM,
      unitCode: 'MTK', // UN/CEFACT code for square meters
    },
    address: address
      ? {
          '@type': 'PostalAddress',
          streetAddress: address.streetAddress,
          addressLocality: address.city,
          addressRegion: address.state,
          addressCountry: address.countryCode,
        }
      : undefined,
    geo:
      address && (address.latitude || address.longitude)
        ? {
            '@type': 'GeoCoordinates',
            latitude: address.latitude,
            longitude: address.longitude,
          }
        : undefined,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'PHP',
      businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
      availability: 'https://schema.org/InStock',
      url,
    },
  }
}
