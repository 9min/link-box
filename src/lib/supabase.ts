import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ---- DB row types (snake_case) ----

export interface LinkRow {
  id: string
  user_id: string
  url: string
  title: string
  description: string
  og_image: string | null
  favicon: string
  domain: string
  category_id: string
  folder_id: string | null
  is_favorite: boolean
  note: string
  visit_count: number
  created_at: string
  updated_at: string
}

export interface FolderRow {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}
