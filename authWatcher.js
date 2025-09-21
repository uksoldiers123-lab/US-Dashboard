import { supabase } from './lib/supabaseClient';

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // user signed in, fetch user data and redirect to dashboard
  } else if (event === 'SIGNED_OUT') {
    // redirect to login
  }
});
