'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRenewProperty } from '@/hooks/properties/useRenewProperty'

// Hand-built rather than added via the shadcn CLI: components/ui/ uses a
// customized "base-nova" style (custom Button/Avatar props like
// render/nativeButton, size), and no Dialog/Modal exists yet — a
// freshly-generated stock dialog risks clashing with those conventions.

const EXPIRATION_DAYS = [7, 15, 30] as const
type ExpirationDays = (typeof EXPIRATION_DAYS)[number]

export function RenewModal({
  propertyId,
  open,
  onOpenChange,
}: {
  propertyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [days, setDays] = useState<ExpirationDays>(30)
  const renewProperty = useRenewProperty()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKeyDown)
    panelRef.current?.focus()

    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])

  if (!open) return null

  async function handleConfirm() {
    await renewProperty.mutateAsync({ id: propertyId, expirationDays: days })
    onOpenChange(false)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="renew-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg outline-none"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute right-4 top-4 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <h2 id="renew-modal-title" className="text-lg font-semibold text-foreground">
          Renew listing
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a fresh listing period.</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {EXPIRATION_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                days === d
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>

        {renewProperty.error && (
          <p className="mt-3 text-sm text-destructive">{renewProperty.error.message}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={renewProperty.isPending}>
            {renewProperty.isPending ? 'Renewing…' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
