import { supabase } from "./supabase"

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  created_at: string
}

export const authService = {
  async signUp(email: string, password: string, firstName: string, lastName: string, role = "staff") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
      },
    })

    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get user profile from our users table
    const { data: profile, error } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      // Return a basic user object using auth metadata
      return {
        id: user.id,
        email: user.email!,
        first_name: user.user_metadata?.first_name || "User",
        last_name: user.user_metadata?.last_name || "Name",
        role: user.user_metadata?.role || "staff",
        created_at: user.created_at,
      } as User
    }

    return profile as User
  },

  async updateProfile(updates: Partial<User>) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No user logged in")

    const { data, error } = await supabase.from("users").update(updates).eq("id", user.id).select().single()

    if (error) throw error
    return data as User
  },
}
