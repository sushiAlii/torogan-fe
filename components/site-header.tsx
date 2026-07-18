'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth/auth-context'

export function SiteHeader() {
  const { status, user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Nestlee
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            List a property
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {status === 'loading' && <div className="h-8 w-40" />}

          {status === 'unauthenticated' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                Sign in
              </Button>
              <Button size="sm" nativeButton={false} render={<Link href="/register" />}>
                Get started
              </Button>
            </>
          )}

          {status === 'authenticated' && user && (
            <>
              <Avatar size="sm">
                <AvatarImage src={user.avatarUrl} alt={user.email} />
                <AvatarFallback>
                  {user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
