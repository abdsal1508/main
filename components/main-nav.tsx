"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Activity } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Activity className="h-6 w-6 text-teal-600" />
        <span className="hidden font-bold sm:inline-block">ProCentric</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/dashboard" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/patients"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/patients") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Patients
        </Link>
        <Link
          href="/claims"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/claims") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Claims
        </Link>
        <Link
          href="/admin"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/admin") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Admin
        </Link>
      </nav>
    </div>
  )
}
