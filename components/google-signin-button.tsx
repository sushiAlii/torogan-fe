'use client'

import { useCallback, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              width?: number
            },
          ) => void
        }
      }
    }
  }
}

type GoogleSignInButtonProps = {
  onCredential: (idToken: string) => void
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
}

export function GoogleSignInButton({
  onCredential,
  text = 'continue_with',
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const [available, setAvailable] = useState(true)

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const init = useCallback(() => {
    if (!clientId) {
      setAvailable(false)
      return
    }
    if (initialized.current || !containerRef.current || !window.google) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => onCredential(response.credential),
    })
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      text,
      width: 320,
    })
    initialized.current = true
  }, [clientId, onCredential, text])

  if (!clientId || !available) {
    return null
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={init}
      />
      <div ref={containerRef} className="flex justify-center" />
    </>
  )
}
