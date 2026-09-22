import { createClient } from '@supabase/supabase-js'

// Fallback to 1994 Coffee Supabase project if environment variables are not set (e.g. in CI/CD or production builds)
const DEFAULT_SUPABASE_URL = 'https://krbegdiqkcfbeqwrfyvm.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyYmVnZGlxa2NmYmVxd3JmeXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MDM3ODksImV4cCI6MjEwNDQ3OTc4OX0.XqG7186XV9-jHhzc6G1nuN4xYXhGy3iImIs-2_3SR6k'

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

export const isConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey !== 'placeholder-key'
)

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase credentials not configured correctly. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

