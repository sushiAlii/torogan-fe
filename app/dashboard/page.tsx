'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, X, ImageIcon, Check } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-context'

type Preview = { id: string; url: string; name: string }

export default function DashboardPage() {
  const router = useRouter()
  const { status } = useAuth()
  const [previews, setPreviews] = useState<Preview[]>([])
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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

  function handleFiles(files: FileList | null) {
    if (!files) return
    const next = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    setPreviews((prev) => [...prev, ...next])
  }

  function removePreview(id: string) {
    setPreviews((prev) => prev.filter((p) => p.id !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
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
            Add the details below. Your listing goes live once reviewed.
          </p>
        </div>

        {submitted && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium text-foreground">Listing submitted</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll notify you once it&apos;s approved.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Property details</CardTitle>
              <CardDescription>
                Photos and accurate info help your listing rent faster.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image upload */}
              <div className="space-y-2">
                <Label htmlFor="photos">Photos</Label>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UploadCloud className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Click to upload images
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG or JPG, up to 10MB each
                  </span>
                </button>
                <input
                  ref={inputRef}
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => handleFiles(e.target.files)}
                />

                {previews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {previews.map((p) => (
                      <div
                        key={p.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        <img
                          src={p.url || '/placeholder.svg'}
                          alt={p.name}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePreview(p.id)}
                          aria-label={`Remove ${p.name}`}
                          className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Property title</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. Sunlit Maple Modern Home"
                />
              </div>

              {/* Phone + Price */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rent">Monthly rent</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="rent"
                      type="number"
                      min="0"
                      required
                      placeholder="2,500"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the space, neighborhood, and what makes it special..."
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline">
                  Save draft
                </Button>
                <Button type="submit">
                  <ImageIcon className="size-4" aria-hidden="true" />
                  Publish listing
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
