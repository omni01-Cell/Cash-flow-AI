import { createClient } from '@supabase/supabase-js';

// Access environment variables securely or use provided defaults
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qtpklgbmpstcotxcrmkg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0cGtsZ2JtcHN0Y290eGNybWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTExMjksImV4cCI6MjA3OTU2NzEyOX0.2z2M3lfzKJzfE0Bc4sVxcPqNOAFjEhM4khACRuPvkBo';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing! Please check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);