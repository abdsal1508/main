"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService, type User } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Initial session check:", session?.user?.id)

        if (session?.user) {
          const currentUser = await authService.getCurrentUser()
          console.log("Current user:", currentUser)
          setUser(currentUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      if (event === "SIGNED_IN" && session?.user) {
        try {
          const currentUser = await authService.getCurrentUser()
          console.log("User signed in:", currentUser)
          setUser(currentUser)
        } catch (error) {
          console.error("Error getting user profile:", error)
          setUser(null)
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out")
        setUser(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("Attempting to sign in:", email)
    try {
      const data = await authService.signIn(email, password)
      if (data.user) {
        const currentUser = await authService.getCurrentUser()
        console.log("Sign in successful:", currentUser)
        setUser(currentUser)

        // Only redirect if we're on an auth page
        if (pathname?.startsWith("/auth")) {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role?: string) => {
    console.log("Attempting to sign up:", email)
    try {
      const data = await authService.signUp(email, password, firstName, lastName, role)
      if (data.user) {
        const currentUser = await authService.getCurrentUser()
        console.log("Sign up successful:", currentUser)
        setUser(currentUser)

        // Only redirect if we're on an auth page
        if (pathname?.startsWith("/auth")) {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signOut = async () => {
    console.log("Signing out")
    try {
      await authService.signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
