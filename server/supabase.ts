import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dwuidfkmzvvccavkrarz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dWlkZmttenZ2Y2NhdmtyYXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDcyMTEsImV4cCI6MjA5MzEyMzIxMX0.f2Z6jHNyYF0UTNavmZipeqJ29NjS1MTOYjT2YUgrLxs';

// Ensure URL is valid for Supabase
if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  // If it's probably just the project ref (e.g. fwuidf...)
  if (!supabaseUrl.includes('.')) {
    supabaseUrl = `https://${supabaseUrl}.supabase.co`;
  } else {
    supabaseUrl = `https://${supabaseUrl}`;
  }
}

try {
  new URL(supabaseUrl);
} catch (e) {
  // Fall back to default if totally malformed
  supabaseUrl = 'https://dwuidfkmzvvccavkrarz.supabase.co';
}

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Database operations will fail.');
}

let _supabaseClient: any = null;
export const supabase: import('@supabase/supabase-js').SupabaseClient = new Proxy({}, {
  get(target, prop) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("MISSING Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Settings.");
    }
    if (!_supabaseClient) {
      _supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
    const val = _supabaseClient[prop];
    if (typeof val === 'function') {
      return val.bind(_supabaseClient);
    }
    return val;
  }
}) as any;
