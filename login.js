
import { supabase } from './lib/supabaseClient';

async function signIn(email, password) {
  const { data, user, session, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // session.access_token is available
  // You can rely on Supabase on the client to persist session in localStorage
  return { user, session, data };
}
