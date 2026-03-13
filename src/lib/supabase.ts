import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vhrzyhqnlngrtvfedzmr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnp5aHFubG5ncnR2ZmVkem1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTYyNjQsImV4cCI6MjA4ODc5MjI2NH0.fM0uGHgoKnD3WVmrJkLivYV66YzlFyTbq8YhZaVOVRg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

