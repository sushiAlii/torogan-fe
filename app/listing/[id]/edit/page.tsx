'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ConnectError } from '@connectrpc/connect'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { ImageUploader, type UploadedPhoto } from '@/components/image-uploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-context'
import { expiryText } from '@/lib/property-status'
import { useGetFeatures } from '@/hooks/features/useGetFeatures'
import { useGetProperty } from '@/hooks/properties/useGetProperty'
import { useGetPropertyAddress } from '@/hooks/addresses/useGetPropertyAddress'
import { useGetPropertyFeatures } from '@/hooks/properties/useGetPropertyFeatures'
import { useUpdateProperty } from '@/hooks/properties/useUpdateProperty'
import { useUpdateAddress } from '@/hooks/addresses/useUpdateAddress'
import { useAddPropertyImage } from '@/hooks/properties/useAddPropertyImage'
import { useRemovePropertyImage } from '@/hooks/properties/useRemovePropertyImage'
import { useAddPropertyFeature } from '@/hooks/properties/useAddPropertyFeature'
import { useRemovePropertyFeature } from '@/hooks/properties/useRemovePropertyFeature'

const PROPERTY_TYPES = ['Apartment', 'Studio', 'House', 'Townhouse'] as const

const selectClassName =
  'h-8 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30'

type ExistingPhoto = { id: string; url: string; isMain: boolean }

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { status, user } = useAuth()

  const enabled = status !== 'loading'
  const { data: property, isLoading: propertyLoading } = useGetProperty(id, { enabled })
  const { data: address, isLoading: addressLoading } = useGetPropertyAddress(id, { enabled })
  const { data: propertyFeaturesRes, isLoading: propertyFeaturesLoading } = useGetPropertyFeatures(id, {
    enabled,
  })
  const { data: featuresRes } = useGetFeatures()
  const amenities = featuresRes?.features ?? []

  const updateProperty = useUpdateProperty()
  const updateAddress = useUpdateAddress()
  const addPropertyImage = useAddPropertyImage()
  const removePropertyImage = useRemovePropertyImage()
  const addPropertyFeature = useAddPropertyFeature()
  const removePropertyFeature = useRemovePropertyFeature()

  const [initialized, setInitialized] = useState(false)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<(typeof PROPERTY_TYPES)[number]>('Apartment')
  const [price, setPrice] = useState('')
  const [sizeSqM, setSizeSqM] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [description, setDescription] = useState('')

  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<number>>(new Set())
  const [originalAmenityIds, setOriginalAmenityIds] = useState<Set<number>>(new Set())

  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([])
  const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(new Set())
  const [newPhotos, setNewPhotos] = useState<UploadedPhoto[]>([])

  const [streetAddress, setStreetAddress] = useState('')
  const [extendedAddress, setExtendedAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Seed the editable fields once every source has loaded, adjusting state
  // during render (no effect, no extra render) — same pattern as the
  // profile page. Runs exactly once: `initialized` gates it.
  if (!initialized && property && address && propertyFeaturesRes) {
    setInitialized(true)
    setTitle(property.title)
    setType(PROPERTY_TYPES.find((t) => t === property.type) ?? 'Apartment')
    setPrice(property.price)
    setSizeSqM(String(property.sizeSqM))
    setBedrooms(String(property.bedrooms))
    setBathrooms(String(property.bathrooms))
    setDescription(property.description)

    const featureIds = new Set(propertyFeaturesRes.features.map((f) => f.id))
    setSelectedAmenityIds(featureIds)
    setOriginalAmenityIds(featureIds)

    setExistingPhotos(property.images.map((img) => ({ id: img.id, url: img.url, isMain: img.isMain })))

    setStreetAddress(address.streetAddress)
    setExtendedAddress(address.extendedAddress ?? '')
    setCity(address.city)
    setState(address.state)
  }

  // Redirect away for anyone who isn't signed in or doesn't own this
  // listing. This is UX, not the real security boundary — every mutation
  // below is independently ownership-checked server-side.
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in')
      return
    }
    if (status === 'authenticated' && user && property && user.id !== property.ownerId) {
      router.replace(`/listing/${id}`)
    }
  }, [status, user, property, id, router])

  function toggleAmenity(amenityId: number) {
    setSelectedAmenityIds((prev) => {
      const next = new Set(prev)
      if (next.has(amenityId)) {
        next.delete(amenityId)
      } else {
        next.add(amenityId)
      }
      return next
    })
  }

  function removeExistingPhoto(photoId: string) {
    setRemovedImageIds((prev) => new Set(prev).add(photoId))
  }

  const visibleExistingPhotos = existingPhotos.filter((p) => !removedImageIds.has(p.id))

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen">
        <SiteHeader />
      </div>
    )
  }

  if (propertyLoading || addressLoading || propertyFeaturesLoading || !property || !address) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
    )
  }

  if (user && user.id !== property.ownerId) {
    // The redirect effect above is already navigating away.
    return (
      <div className="min-h-screen">
        <SiteHeader />
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (
      title.trim() === '' ||
      description.trim() === '' ||
      streetAddress.trim() === '' ||
      city.trim() === '' ||
      state.trim() === ''
    ) {
      setError('Please fill in all required fields.')
      return
    }

    const priceNum = Number(price)
    const bedroomsNum = Number(bedrooms)
    const bathroomsNum = Number(bathrooms)
    const sizeSqMNum = Number(sizeSqM)

    if (!(priceNum > 0)) {
      setError('Monthly rent must be greater than 0.')
      return
    }
    if (!(bedroomsNum > 0)) {
      setError('Bedrooms must be greater than 0.')
      return
    }
    if (!(bathroomsNum > 0)) {
      setError('Bathrooms must be greater than 0.')
      return
    }
    if (!(sizeSqMNum > 0)) {
      setError('Size must be greater than 0.')
      return
    }

    setSubmitting(true)

    try {
      await updateProperty.mutateAsync({
        id,
        title,
        type,
        price,
        sizeSqM: sizeSqMNum,
        bedrooms: bedroomsNum,
        bathrooms: bathroomsNum,
        description,
      })

      await updateAddress.mutateAsync({
        id: address!.id,
        streetAddress,
        extendedAddress: extendedAddress || undefined,
        city,
        state,
        countryCode: 'PH',
        latitude: 0,
        longitude: 0,
      })

      for (const featureId of selectedAmenityIds) {
        if (!originalAmenityIds.has(featureId)) {
          await addPropertyFeature.mutateAsync({ propertyId: id, featureId })
        }
      }
      for (const featureId of originalAmenityIds) {
        if (!selectedAmenityIds.has(featureId)) {
          await removePropertyFeature.mutateAsync({ propertyId: id, featureId })
        }
      }

      // Sequential, not Promise.all — same read-count-then-insert race the
      // create form's comment describes applies here too.
      for (const imageId of removedImageIds) {
        await removePropertyImage.mutateAsync({ propertyId: id, imageId })
      }
      for (const [i, photo] of newPhotos.entries()) {
        await addPropertyImage.mutateAsync({
          propertyId: id,
          url: photo.publicUrl,
          isMain: photo.isMain,
          // Offset past every original photo's position so a new photo
          // never collides with a surviving existing one's position.
          position: existingPhotos.length + i,
        })
      }

      router.push(`/listing/${id}`)
    } catch (err) {
      setError(ConnectError.from(err).message)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Edit listing</h1>
          <p className="mt-2 text-muted-foreground">{expiryText(property.expiresAt)} — use Renew on My Listings to extend.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive">
              <AlertTriangle className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium text-foreground">Couldn&apos;t save changes</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property details</CardTitle>
                <CardDescription>Update anything that&apos;s changed or was wrong.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {visibleExistingPhotos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current photos</Label>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {visibleExistingPhotos.map((photo) => (
                        <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                          <Image src={photo.url} alt="" fill className="object-cover" />
                          {photo.isMain && (
                            <span className="absolute left-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                              Main
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingPhoto(photo.id)}
                            aria-label="Remove photo"
                            className="absolute right-1 top-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background"
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="photos">Add photos</Label>
                  <ImageUploader
                    onChange={setNewPhotos}
                    disabled={submitting}
                    maxPhotos={Math.max(0, 5 - visibleExistingPhotos.length)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Property title</Label>
                  <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Property type</Label>
                    <select
                      id="type"
                      required
                      value={type}
                      onChange={(e) => setType(e.target.value as (typeof PROPERTY_TYPES)[number])}
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
                        step="0.01"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      required
                      step="1"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      required
                      step="1"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size (m²)</Label>
                    <Input
                      id="size"
                      type="number"
                      required
                      step="0.1"
                      value={sizeSqM}
                      onChange={(e) => setSizeSqM(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                <CardDescription>Where the property is located.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street address</Label>
                  <Input
                    id="streetAddress"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extendedAddress">Unit / apartment (optional)</Label>
                  <Input
                    id="extendedAddress"
                    value={extendedAddress}
                    onChange={(e) => setExtendedAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / region</Label>
                    <Input id="state" required value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" nativeButton={false} render={<Link href={`/listing/${id}`} />}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
