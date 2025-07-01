import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ccrfyxahxsgjyskrdgqd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcm' +
  'Z5eGFoeHNnanlza3JkZ3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNDg4MTksImV4cCI6MjA1OTkyNDgxOX0.SW0etXALsXojq3C' +
  '8g6e1T4qNufHyYZzRLF3Er5MxVYw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabase() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n1. Testing connection...')
    const { data: tables, error: connectionError } = await supabase
      .from('waitlist')
      .select('*')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Connection error:', {
        message: connectionError.message,
        details: connectionError.details,
        hint: connectionError.hint,
        code: connectionError.code
      })
      return
    }
    
    console.log('✅ Connection successful!')
    
    // Test 2: Try to insert a test record
    console.log('\n2. Testing insert...')
    const testEmail = `test+${Date.now()}@example.com`
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: testEmail,
        timestamp: new Date().toISOString(),
        user_agent: 'Test Script'
      })
      .select()
    
    if (error) {
      console.error('❌ Insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        full_error: JSON.stringify(error, null, 2)
      })
    } else {
      console.log('✅ Insert successful!', data)
      
      // Clean up - delete the test record
      await supabase
        .from('waitlist')
        .delete()
        .eq('email', testEmail)
      console.log('🧹 Test record cleaned up')
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

testSupabase() 