import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ImageGallery } from "@/components/image-gallery";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ListingContactCard } from "@/components/listing-contact-card";
import { ShareListingButton } from "@/components/share-listing-button";
import { formatPrice } from "@/lib/format";
import { getListingData } from "@/lib/api/listing-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getListingData(id); // cache()'d — shared with the page body below, no extra network call

  if (!data) {
    return { title: "Listing not found — Torogan" };
  }

  const { property } = data;
  const title = `${property.title} — ${formatPrice(property.price)}/mo | Torogan`;
  const description =
    property.description.slice(0, 160) ||
    `${property.type} • ${property.bedrooms} bed • ${property.bathrooms} bath • ${property.sizeSqM} m². View on Torogan.`;
  const image =
    property.mainImageUrl || property.images[0]?.url || "/placeholder.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/listing/${id}`,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getListingData(id);

  if (!data) {
    notFound();
  }

  const { property, address, features } = data;

  const images =
    property.images.length > 0
      ? property.images
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((img) => img.url)
      : property.mainImageUrl
        ? [property.mainImageUrl]
        : ["/placeholder.svg"];

  const location = address ? `${address.city}, ${address.state}` : null;
  // Same canonical absolute URL used in generateMetadata's openGraph.url
  // above, so the shared link and the OG-tagged link are identical.
  const listingUrl = `https://torogan.com/listing/${id}`;

  const stats = [
    { icon: BedDouble, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Maximize, label: "m²", value: property.sizeSqM.toLocaleString() },
  ];

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
              <div className="mt-4">
                <ShareListingButton url={listingUrl} title={property.title} />
              </div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center text-center"
                >
                  <s.icon className="size-5 text-primary" aria-hidden="true" />
                  <span className="mt-1.5 font-semibold text-foreground">
                    {s.value}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Amenities */}
            {features.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <h2 className="font-semibold text-foreground">Amenities</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {features.map((amenity) => (
                    <Badge key={amenity.id} variant="secondary">
                      {amenity.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <ListingContactCard propertyId={property.id} />
          </div>
        </div>

        {/* Description */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              About this home
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              {property.description || "No description provided."}
            </p>
          </div>

          {address && (
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Address
              </h2>
              <Separator className="my-3" />
              <p className="text-sm text-foreground">
                {address.streetAddress}
                {address.extendedAddress ? `, ${address.extendedAddress}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.state} {address.countryCode}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
