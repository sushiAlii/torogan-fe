'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex w-full items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by city, neighborhood, or property"
          aria-label="Search rentals"
          className="h-11 border-0 bg-transparent pl-9 text-base shadow-none focus-visible:ring-0"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 rounded-xl text-muted-foreground"
        aria-label="Filters"
      >
        <SlidersHorizontal className="size-5" />
      </Button>
      <Button className="hidden h-11 rounded-xl px-6 sm:inline-flex">Search</Button>
    </div>
  )
}
