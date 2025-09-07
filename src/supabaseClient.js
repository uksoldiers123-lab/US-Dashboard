    const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function createServerClientForRequest(req) {
  // If you want to pass cookies or headers from the incoming request, you can
  // Here we just return a basic client; you can extend with headers if needed
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

module.exports = { createServerClientForRequest };
   
