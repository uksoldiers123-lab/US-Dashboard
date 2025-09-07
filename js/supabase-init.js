
<script>
  // In a real setup, you might fetch these from a safe source or embed via server-side rendering.
  const SUPABASE_URL = 'https://gifguoyqccozlijrxgcf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZmd1b3lxY2NvemxpanJ4Z2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTg2MzUsImV4cCI6MjA3MjE5NDYzNX0.gwZnr8fKE7qXuLi8B5Merul3cVAXZ1r6SaWEUoAJWX0';


  // Use the CDN client to create a global instance
  const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Expose it globally for other scripts
  window.supabase = supabase;
</script>

