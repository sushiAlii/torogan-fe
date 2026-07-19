'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDeleteProperty } from '@/hooks/properties/useDeleteProperty'

// Hand-built like renew-modal.tsx — see its header comment for why.

export function DeleteConfirmModal({
  propertyId,
  open,
  onOpenChange,
}: {
  propertyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [confirmText, setConfirmText] = useState('')
  const [prevOpen, setPrevOpen] = useState(open)
  const deleteProperty = useDeleteProperty()
  const panelRef = useRef<HTMLDivElement>(null)

  // Clear the confirm text once the modal closes, so reopening it (e.g. for
  // the same listing after Cancel) requires retyping — adjusted during
  // render rather than in an effect, same pattern as the profile page.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (!open) setConfirmText('')
  }

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

  const canConfirm = confirmText.trim().toLowerCase() === 'delete' && !deleteProperty.isPending

  async function handleConfirm() {
    if (!canConfirm) return
    await deleteProperty.mutateAsync({ id: propertyId })
    onOpenChange(false)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
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

        <h2 id="delete-modal-title" className="text-lg font-semibold text-foreground">
          Delete listing
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This removes it from public listings. You can restore it later from the Deleted tab.
        </p>

        <div className="mt-4 space-y-2">
          <label htmlFor="delete-confirm-input" className="text-sm text-muted-foreground">
            Type <span className="font-medium text-foreground">delete</span> to confirm.
          </label>
          <Input
            id="delete-confirm-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
        </div>

        {deleteProperty.error && (
          <p className="mt-3 text-sm text-destructive">{deleteProperty.error.message}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!canConfirm}>
            {deleteProperty.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
