// Canonical production origin, used anywhere an absolute URL is needed:
// metadataBase, JSON-LD, the sitemap, robots.txt, and the share-link button.
// Override via NEXT_PUBLIC_SITE_URL per-environment (e.g. a preview deploy).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://torogan.com'
