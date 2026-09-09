import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'

export const userService = {
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async update(id: string, updates: Partial<Pick<Profile, 'name' | 'role' | 'status'>>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async createUser(email: string, password: string, name: string, role: UserRole): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession()
    const previousSession = sessionData.session

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    })
    if (error) throw new Error(error.message)

    // Upsert profile entry safely (avoid duplicate key if trigger already ran)
    if (data.user) {
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
        role,
        status: 'active',
      })
      if (profileErr) throw new Error(profileErr.message)
    }

    // Restore admin session if signUp replaced it
    if (previousSession?.access_token) {
      await supabase.auth.setSession({
        access_token: previousSession.access_token,
        refresh_token: previousSession.refresh_token,
      })
    }
  },

  async toggleStatus(id: string, currentStatus: string): Promise<void> {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active'
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id)
    if (error) throw new Error(error.message)
  },
}
