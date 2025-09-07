       import { createClient } from '@supabase/supabase-js';

       const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gifguoyqccozlijrxgcf.supabase.co';
       const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZmd1b3lxY2NvemxpanJ4Z2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTg2MzUsImV4cCI6MjA3MjE5NDYzNX0.gwZnr8fKE7qXuLi8B5Merul3cVAXZ1r6SaWEUoAJWX0';

       export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
