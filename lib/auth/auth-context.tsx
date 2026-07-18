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

import { authClient } from '@/lib/api/client'
import { setAccessToken } from '@/lib/api/token'
import type { User } from '@/lib/gen/auth_pb'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  user: User | undefined
  status: AuthStatus
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  signInWithGoogle: (idToken: string) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [status, setStatus] = useState<AuthStatus>('loading')

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
    } catch (err) {
      throw ConnectError.from(err)
    }
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    try {
      const res = await authClient.register({ email, password })
      setAccessToken(res.accessToken)
      setUser(res.user)
      setStatus('authenticated')
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
  }, [])

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
