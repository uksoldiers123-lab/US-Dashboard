
// Purpose: Guarantee window.supabase is created before any signup logic runs

(function() {
  // Replace these with your real values for production
  const SUPABASE_URL = 'https://gifguoyqccozlijrxgcf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZmd1b3lxY2NvemxpanJ4Z2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTg2MzUsImV4cCI6MjA3MjE5NDYzNX0.gwZnr8fKE7qXuLi8B5Merul3cVAXZ1r6SaWEUoAJWX0';

  // Idempotent: do not recreate if already present
  if (!window.supabase) {
    // Ensure the supabase-js library is loaded
    if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
      console.error('Supabase JS library not loaded yet. Ensure this script runs after the CDN include.');
      return;
    }

    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized:', !!window.supabase);
  } else {
    console.log('Supabase already initialized');
  }

  // Optional: expose a tiny readiness helper for quick checks
  window.__SUPABASE_READY__ = !!window.supabase;

  // Optional: a tiny test function you can call from the console
  window.__checkSupabase = function() {
    console.log('CHECK: Supabase exists?', !!window.supabase);
    console.log('CHECK: window.supabase object:', window.supabase);
  };
  // Can auto-run a quick check
  window.__checkSupabase();
})();
