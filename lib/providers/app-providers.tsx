'use client'

import { useState, type ReactNode } from 'react'
import { TransportProvider } from '@connectrpc/connect-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth/auth-context'
import { transport } from '@/lib/api/client'

export function AppProviders({ children }: { children: ReactNode }) {
  // Created with useState, not at module scope, so each client mount gets
  // its own QueryClient instance rather than sharing one across requests.
  const [queryClient] = useState(() => new QueryClient())

  return (
    <TransportProvider transport={transport}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </TransportProvider>
  )
}
