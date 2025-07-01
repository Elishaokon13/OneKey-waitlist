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
      // First, normalize the email to lowercase for consistent checking
      const normalizedEmail = email.toLowerCase().trim()
      
      // Check if email already exists using maybeSingle() to avoid errors when no record found
      console.log('🔍 Checking for existing email:', normalizedEmail)
      const { data: existing, error: checkError } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking for existing email:', checkError)
        return { 
          success: false, 
          error: 'Failed to verify email' 
        }
      }

      if (existing) {
        console.log('❌ Email already exists:', normalizedEmail)
        return { 
          success: false, 
          error: 'Email already registered' 
        }
      }

      console.log('✅ Email is new, proceeding with insert:', normalizedEmail)

      // Insert new email
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert({
          email: normalizedEmail,
          timestamp: new Date().toISOString(),
          user_agent: userAgent || 'Unknown'
        })

      if (insertError) {
        console.error('Supabase insert error:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
          full_error: JSON.stringify(insertError, null, 2)
        })
        
        // Check if it's a unique constraint violation (duplicate email at DB level)
        if (insertError.code === '23505') {
          return { 
            success: false, 
            error: 'Email already registered' 
          }
        }
        
        return { 
          success: false, 
          error: 'Failed to save email' 
        }
      }

      console.log('🎉 Email successfully saved to database:', normalizedEmail)
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