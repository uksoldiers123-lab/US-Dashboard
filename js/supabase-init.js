
const SUPABASE_URL = 'https://gifguoyqccozlijrxgcf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZmd1b3lxY2NvemxpanJ4Z2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTg2MzUsImV4cCI6MjA3MjE5NDYzNX0.gwZnr8fKE7qXuLi8B5Merul3cVAXZ1r6SaWEUoAJWX0';

(function initSupabase() {
  // If using CDN script, supabase.createClient is available on the global `supabase` object
  if (typeof supabase?.createClient === 'function') {
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = client;
  } else {
    console.error('Supabase CDN client not found. Ensure the CDN script is loaded.');
  }
})();
