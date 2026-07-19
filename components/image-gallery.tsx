'use client'

import { useState } from 'react'

export function ImageGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted sm:aspect-[16/10]">
        <img
          src={images[active] || '/placeholder.svg'}
          alt={`${title} — photo ${active + 1}`}
          className="size-full object-cover"
        />
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View photo ${i + 1}`}
            aria-current={i === active}
            className={`relative aspect-square cursor-pointer overflow-hidden rounded-xl border bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              i === active
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-border hover:opacity-80'
            }`}
          >
            <img
              src={src || '/placeholder.svg'}
              alt={`${title} thumbnail ${i + 1}`}
              className="size-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
