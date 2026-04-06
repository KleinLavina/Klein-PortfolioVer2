import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseClientKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseClientKey) {
  console.warn('Supabase environment variables are not configured. Supabase features will be unavailable.');
}

export const supabase = supabaseUrl && supabaseClientKey
  ? createClient(supabaseUrl, supabaseClientKey)
  : null as unknown as ReturnType<typeof createClient>;

// Types for your tables
export interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
  created_at: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
  created_at: string;
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('count')
      .limit(1);
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected)
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}
