import Link from "next/link";
import { BedDouble, Bath, Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { Property } from "@/lib/gen/property_pb";
import Image from "next/image";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/listing/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <Image
          src={property.mainImageUrl || "/placeholder.svg"}
          alt={property.title}
          className="size-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          width={0}
          height={0}
        />
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground shadow-sm backdrop-blur">
          {property.type}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl font-semibold tracking-tight text-foreground">
            {formatPrice(property.price)}
            <span className="text-sm font-normal text-muted-foreground">
              /mo
            </span>
          </span>
        </div>

        <div>
          <h3 className="text-pretty font-medium leading-snug text-foreground">
            {property.title}
          </h3>
        </div>

        <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-4" aria-hidden="true" />
            {property.bedrooms} bd
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-4" aria-hidden="true" />
            {property.bathrooms} ba
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize className="size-4" aria-hidden="true" />
            {property.sizeSqM.toLocaleString()} m²
          </span>
        </div>
      </div>
    </Link>
  );
}
