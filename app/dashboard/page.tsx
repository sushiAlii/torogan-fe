"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectError } from "@connectrpc/connect";
import { ImageIcon, AlertTriangle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ImageUploader, type UploadedPhoto } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { useGetFeatures } from "@/hooks/features/useGetFeatures";
import { useCreateProperty } from "@/hooks/properties/useCreateProperty";
import { useAddPropertyImage } from "@/hooks/properties/useAddPropertyImage";
import { useAddPropertyFeature } from "@/hooks/properties/useAddPropertyFeature";
import { useCreateAddress } from "@/hooks/addresses/useCreateAddress";

const PROPERTY_TYPES = ["Apartment", "Studio", "House", "Townhouse"] as const;
const EXPIRATION_DAYS = [7, 15, 30] as const;

const selectClassName =
  "h-8 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export default function DashboardPage() {
  const router = useRouter();
  const { status } = useAuth();

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  const [title, setTitle] = useState("");
  const [type, setType] =
    useState<(typeof PROPERTY_TYPES)[number]>("Apartment");
  const [expirationDays, setExpirationDays] =
    useState<(typeof EXPIRATION_DAYS)[number]>(30);
  const [price, setPrice] = useState("");
  const [sizeSqM, setSizeSqM] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [description, setDescription] = useState("");

  const { data: featuresRes } = useGetFeatures();
  const amenities = featuresRes?.features ?? [];
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<number>>(
    new Set(),
  );

  const createProperty = useCreateProperty();
  const addPropertyImage = useAddPropertyImage();
  const addPropertyFeature = useAddPropertyFeature();
  const createAddress = useCreateAddress();

  const [streetAddress, setStreetAddress] = useState("");
  const [extendedAddress, setExtendedAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in");
    }
  }, [status, router]);

  function toggleAmenity(id: number) {
    setSelectedAmenityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const property = await createProperty.mutateAsync({
        title,
        type,
        price,
        sizeSqM: sizeSqM ? Number(sizeSqM) : 0,
        bedrooms: bedrooms ? Number(bedrooms) : 0,
        bathrooms: bathrooms ? Number(bathrooms) : 0,
        description,
        expirationDays,
      });

      // Sequential, not Promise.all: each add is a read-count-then-insert
      // transaction on the backend, so concurrent calls for the same
      // property can race on which image becomes "main". Position order
      // also depends on these landing in order.
      for (const [position, photo] of photos.entries()) {
        await addPropertyImage.mutateAsync({
          propertyId: property.id,
          url: photo.publicUrl,
          isMain: photo.isMain,
          position,
        });
      }

      for (const featureId of selectedAmenityIds) {
        await addPropertyFeature.mutateAsync({
          propertyId: property.id,
          featureId,
        });
      }

      await createAddress.mutateAsync({
        propertyId: property.id,
        streetAddress,
        extendedAddress: extendedAddress || undefined,
        city,
        state,
        countryCode: "PH",
        latitude: 0,
        longitude: 0,
      });

      router.push(`/listing/${property.id}`);
    } catch (err) {
      setError(ConnectError.from(err).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            List a new property
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add the details below. Your listing goes live once submitted.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive">
              <AlertTriangle className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium text-foreground">
                Couldn&apos;t publish listing
              </p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property details</CardTitle>
                <CardDescription>
                  Photos and accurate info help your listing rent faster.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="photos">Photos</Label>
                  <ImageUploader onChange={setPhotos} disabled={submitting} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Property title</Label>
                  <Input
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sunlit Maple Modern Home"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="type">Property type</Label>
                    <select
                      id="type"
                      required
                      value={type}
                      onChange={(e) =>
                        setType(
                          e.target.value as (typeof PROPERTY_TYPES)[number],
                        )
                      }
                      className={selectClassName}
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Monthly rent</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₱
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="50,000"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expirationDays">Listing duration</Label>
                    <select
                      id="expirationDays"
                      required
                      value={expirationDays}
                      onChange={(e) =>
                        setExpirationDays(
                          EXPIRATION_DAYS.find(
                            (d) => String(d) === e.target.value,
                          ) ?? EXPIRATION_DAYS[0],
                        )
                      }
                      className={selectClassName}
                    >
                      {EXPIRATION_DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d} days
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      step="1"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      placeholder="2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      step="1"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size (m²)</Label>
                    <Input
                      id="size"
                      type="number"
                      min="0"
                      step="0.1"
                      value={sizeSqM}
                      onChange={(e) => setSizeSqM(e.target.value)}
                      placeholder="45.5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the space, neighborhood, and what makes it special..."
                  />
                </div>

                {amenities.length > 0 && (
                  <div className="space-y-2">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                      {amenities.map((amenity) => (
                        <label
                          key={amenity.id}
                          htmlFor={`amenity-${amenity.id}`}
                          className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                        >
                          <input
                            id={`amenity-${amenity.id}`}
                            type="checkbox"
                            checked={selectedAmenityIds.has(amenity.id)}
                            onChange={() => toggleAmenity(amenity.id)}
                            className="size-4 cursor-pointer rounded border-input accent-primary"
                          />
                          {amenity.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
                <CardDescription>
                  Where the property is located.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street address</Label>
                  <Input
                    id="streetAddress"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="123 Maple Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extendedAddress">
                    Unit / apartment (optional)
                  </Label>
                  <Input
                    id="extendedAddress"
                    value={extendedAddress}
                    onChange={(e) => setExtendedAddress(e.target.value)}
                    placeholder="#12-34"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Manila"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / region</Label>
                    <Input
                      id="state"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="National Capital Region"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={submitting}>
                <ImageIcon className="size-4" aria-hidden="true" />
                {submitting ? "Publishing…" : "Publish listing"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
