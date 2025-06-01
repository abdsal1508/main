"use client"

import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

export function SiteHeader() {
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <UserNav />
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
