
const SUPABASE_URL = 'https://gifguoyqccozlijrxgcf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZmd1b3lxY2NvemxpanJ4Z2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTg2MzUsImV4cCI6MjA3MjE5NDYzNX0.gwZnr8fKE7qXuLi8B5Merul3cVAXZ1r6SaWEUoAJWX0';

const supabase = (typeof window !== 'undefined' && window.supabase) || (function() {
  // Create a local singleton if not present
  return window.supabase = window.supabase || supabaseInit();
})();

function supabaseInit() {
  // Make the createClient available globally as window.supabase
  // eslint-disable-next-line no-undef
  const { createClient } = window.supabaseJs || {};
  // In CDN environment, the library exposes window.supabase as a global object with createClient
  // If using the CDN, the library attaches as supabase.createClient on the global variable `supabase`
  // Simpler approach: use the global `supabase` variable provided by the CDN
  // We'll just return an object with a createClient function from the global
  if (typeof window.supabase === 'object' && typeof window.supabase.createClient === 'function') {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return client;
  }
  // Fallback: return a simple wrapper (this block is rarely needed if CDN loads correctly)
  return {
    from: (table) => ({ select: () => Promise.resolve({ data: [], error: null }) }),
  };
}

// Expose a helper to use the global client in other scripts
window.supabase = typeof window.supabase === 'object' && typeof window.supabase.createClient === 'function'
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : (function(){ return null; })();
