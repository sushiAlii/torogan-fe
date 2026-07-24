'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ConnectError } from '@connectrpc/connect'
import { useQueryClient } from '@tanstack/react-query'

import { authClient } from '@/lib/api/client'
import { setAccessToken } from '@/lib/api/token'
import type { User } from '@/lib/gen/auth_pb'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  user: User | undefined
  status: AuthStatus
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string, name: string, phone: string) => Promise<User>
  signInWithGoogle: (idToken: string) => Promise<User>
  signOut: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const queryClient = useQueryClient()

  useEffect(() => {
    let cancelled = false

    authClient
      .refreshToken({})
      .then((res) => {
        if (cancelled) return
        setAccessToken(res.accessToken)
        setUser(res.user)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        setAccessToken(null)
        setUser(undefined)
        setStatus('unauthenticated')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authClient.login({ email, password })
      setAccessToken(res.accessToken)
      setUser(res.user)
      setStatus('authenticated')
      // res.user is typed optional on the wire message; login always
      // returns one on success, so this narrows for callers.
      if (!res.user) throw new Error('login response missing user')
      return res.user
    } catch (err) {
      throw ConnectError.from(err)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name: string, phone: string) => {
    try {
      const res = await authClient.register({ email, password, name, phone })
      setAccessToken(res.accessToken)
      setUser(res.user)
      setStatus('authenticated')
      if (!res.user) throw new Error('register response missing user')
      return res.user
    } catch (err) {
      throw ConnectError.from(err)
    }
  }, [])

  const signInWithGoogle = useCallback(async (idToken: string) => {
    try {
      const res = await authClient.signInWithGoogle({ idToken })
      setAccessToken(res.accessToken)
      setUser(res.user)
      setStatus('authenticated')
      if (!res.user) throw new Error('signInWithGoogle response missing user')
      return res.user
    } catch (err) {
      throw ConnectError.from(err)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await authClient.logout({})
    } catch {
      // best-effort — the HttpOnly cookie can only be cleared server-side,
      // but local state should still reset even if the request fails.
    }
    setAccessToken(null)
    setUser(undefined)
    setStatus('unauthenticated')
    // Drop every cached query (e.g. GetMe) so the next session never reads
    // this session's cached data — the QueryClient outlives sign-out/sign-in
    // since neither triggers a page reload.
    queryClient.clear()
  }, [queryClient])

  const updateUser = useCallback((next: User) => {
    setUser(next)
  }, [])

  const value = useMemo(
    () => ({ user, status, login, register, signInWithGoogle, signOut, updateUser }),
    [user, status, login, register, signInWithGoogle, signOut, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
