import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xnjrcridyiqxtqsswbcu.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuanJjcmlkeWlxeHRxc3N3YmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODAwMDksImV4cCI6MjA2MzQ1NjAwOX0.O7s8o5HPTl8rQICY6te2DQ7ZvADFpiZ8vPW5-JX-sEQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  return createClient(
    supabaseUrl,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuanJjcmlkeWlxeHRxc3N3YmN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4MDAwOSwiZXhwIjoyMDYzNDU2MDA5fQ.ayrPU6kJ6PFYw4Z5okiVyp3SS9ZP48VQfnfoQHnOY1Q",
  )
}
