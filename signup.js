
import { supabase } from './lib/supabaseClient';

async function signUp(email, password, name) {
  // Client-side validation
  if (!email || !password) throw new Error('Missing credentials');

  // Sign up
  const { user, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });

  if (error) throw error;

  // If you also manage a separate profiles table:
  // await createProfileIfNeeded(user.id, { name, email });
  return user;
}
