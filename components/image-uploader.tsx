'use client'

import { useEffect, useRef, useState } from 'react'
import { Star, UploadCloud, X, Loader2, AlertTriangle } from 'lucide-react'
import { useCreatePresignedUpload } from '@/hooks/uploads/useCreatePresignedUpload'

export type UploadedPhoto = {
  publicUrl: string
  isMain: boolean
}

type PhotoItem = {
  id: string
  previewUrl: string
  publicUrl?: string
  status: 'uploading' | 'done' | 'error'
  error?: string
  isMain: boolean
}

const MAX_PHOTOS = 5

function fileExtension(file: File) {
  const fromName = file.name.split('.').pop()
  if (fromName && fromName !== file.name) return fromName.toLowerCase()
  // Fall back to deriving from MIME type, e.g. "image/jpeg" -> "jpeg"
  return file.type.split('/').pop() ?? 'jpg'
}

export function ImageUploader({
  onChange,
  disabled,
}: {
  onChange: (photos: UploadedPhoto[]) => void
  disabled?: boolean
}) {
  const [items, setItems] = useState<PhotoItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const createPresignedUpload = useCreatePresignedUpload()

  const remainingSlots = MAX_PHOTOS - items.length

  // Sync the successfully-uploaded subset up to the parent whenever items
  // changes — the caller persists these via addPropertyImage on submit.
  // This has to live in an effect, not inline inside a setItems updater:
  // React can invoke updater functions during render, and calling a
  // different component's setState from there is not allowed.
  useEffect(() => {
    const done = items
      .filter((item): item is PhotoItem & { publicUrl: string } => item.status === 'done' && !!item.publicUrl)
      .map((item) => ({ publicUrl: item.publicUrl, isMain: item.isMain }))
    onChange(done)
  }, [items, onChange])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const toAdd = Array.from(files).slice(0, remainingSlots)
    const newItems: PhotoItem[] = toAdd.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      status: 'uploading',
      // The very first photo added (when nothing else exists yet) becomes main by default.
      isMain: items.length === 0 && toAdd.indexOf(file) === 0,
    }))

    setItems((prev) => [...prev, ...newItems])

    await Promise.all(
      toAdd.map(async (file, i) => {
        const item = newItems[i]
        try {
          const { uploadUrl, publicUrl } = await createPresignedUpload.mutateAsync({
            contentType: file.type || 'application/octet-stream',
            fileExt: fileExtension(file),
          })

          const putRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
          })
          if (!putRes.ok) {
            throw new Error(`upload failed with status ${putRes.status}`)
          }

          setItems((prev) =>
            prev.map((p) => (p.id === item.id ? { ...p, status: 'done' as const, publicUrl } : p)),
          )
        } catch (err) {
          setItems((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, status: 'error' as const, error: err instanceof Error ? err.message : 'Upload failed' }
                : p,
            ),
          )
        }
      }),
    )
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const removed = prev.find((p) => p.id === id)
      let next = prev.filter((p) => p.id !== id)
      // If the removed photo was main and others remain, promote the first one.
      if (removed?.isMain && next.length > 0 && !next.some((p) => p.isMain)) {
        next = next.map((p, i) => (i === 0 ? { ...p, isMain: true } : p))
      }
      return next
    })
  }

  function setMain(id: string) {
    setItems((prev) => prev.map((p) => ({ ...p, isMain: p.id === id })))
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || remainingSlots <= 0}
        onClick={() => inputRef.current?.click()}
        className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="size-6" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-foreground">
          {remainingSlots > 0 ? 'Click to upload images' : 'Maximum of 5 photos reached'}
        </span>
        <span className="text-xs text-muted-foreground">
          PNG or JPG &middot; up to {MAX_PHOTOS} photos &middot; {remainingSlots} remaining
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        disabled={disabled || remainingSlots <= 0}
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <img src={item.previewUrl} alt="" className="size-full object-cover" />

              {item.status === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
                </div>
              )}

              {item.status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/90 p-1 text-center">
                  <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
                  <span className="text-[10px] leading-tight text-destructive">{item.error}</span>
                </div>
              )}

              {item.status === 'done' && item.isMain && (
                <span className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  <Star className="size-2.5 fill-current" aria-hidden="true" />
                  Main
                </span>
              )}

              {item.status === 'done' && !item.isMain && (
                <button
                  type="button"
                  onClick={() => setMain(item.id)}
                  className="absolute inset-x-1 bottom-1 cursor-pointer rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground opacity-0 shadow-sm transition hover:bg-background group-hover:opacity-100"
                >
                  Set as main
                </button>
              )}

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
