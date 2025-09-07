

export async function signUpUser(email, password, displayName) {
  const { data, error } = await window.supabase.auth.signUp(
    { email, password },
    { data: { display_name: displayName || '' } }
  );
  return { data, error };
}

export async function signInUser(email, password) {
  const { data, error } = await window.supabase.auth.signIn({ email, password });
  return { data, error };
}

export async function getCurrentUser() {
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

export async function signOutUser() {
  const { data, error } = await window.supabase.auth.signOut();
  return { data, error };
}
