
async function signUpUser(email, password, displayName) {
  const { data, error } = await window.supabase.auth.signUp(
    { email, password },
    { data: { display_name: displayName || '' } }
  );
  return { data, error };
}

async function signInUser(email, password) {
  const { user, session, error } = await window.supabase.auth.signIn({ email, password });
  return { user, session, error };
}

async function signInWithProvider(provider) {
  return await window.supabase.auth.signIn({ provider });
}

async function getCurrentUser() {
  try {
    const { data } = await window.supabase.auth.getUser();
    return data?.user ?? null;
  } catch {
    try {
      return window.supabase.auth.user?.() ?? null;
    } catch {
      return null;
    }
  }
}

async function signOutUser() {
  const { data, error } = await window.supabase.auth.signOut();
  return { data, error };
}
