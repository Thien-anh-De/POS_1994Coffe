import { createClient } from '@supabase/supabase-js'

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://krbegdiqkcfbeqwrfyvm.supabase.co'
export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyYmVnZGlxa2NmYmVxd3JmeXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MDM3ODksImV4cCI6MjEwNDQ3OTc4OX0.XqG7186XV9-jHhzc6G1nuN4xYXhGy3iImIs-2_3SR6k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

