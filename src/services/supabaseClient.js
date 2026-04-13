import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
// ADICIONE ISSO AQUI:
console.log("DEBUG SUPABASE URL:", supabaseUrl);
console.log("DEBUG KEY EXISTS:", !!supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey)