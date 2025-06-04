import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xxpvouzikaaouyxrhuzc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cHZvdXppa2Fhb3V5eHJodXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTUzNzgsImV4cCI6MjA2NDYzMTM3OH0.OlvLCCMRboHrDoA422ztqhSr70RO3zxd3CzQ5KM50QI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 