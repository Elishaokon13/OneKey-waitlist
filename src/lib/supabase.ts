import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface WaitlistEntry {
  id?: number
  email: string
  timestamp: string
  user_agent?: string
  created_at?: string
}

export const waitlistService = {
  async addEmail(email: string, userAgent?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: existing } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email)
        .single()

      if (existing) {
        return { 
          success: false, 
          error: 'Email already registered' 
        }
      }

      const { error } = await supabase
        .from('waitlist')
        .insert({
          email,
          timestamp: new Date().toISOString(),
          user_agent: userAgent || 'Unknown'
        })

      if (error) {
        console.error('Supabase insert error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          full_error: JSON.stringify(error, null, 2)
        })
        return { 
          success: false, 
          error: 'Failed to save email' 
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Waitlist service error:', error)
      return { 
        success: false, 
        error: 'Something went wrong' 
      }
    }
  },

  async getAllEmails(): Promise<WaitlistEntry[]> {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch emails:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Get emails error:', error)
      return []
    }
  },

  async getCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Failed to get count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Get count error:', error)
      return 0
    }
  }
} 