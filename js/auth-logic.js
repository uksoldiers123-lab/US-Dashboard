
async function getCurrentUser() {
  try {
    // Supabase v2 uses getUser from auth
    const { data: user } = await supabase.auth.getUser();
    return user?.user ?? null;
  } catch (e) {
    // Fallback for older versions
    try {
      const user = supabase.auth.user();
      return user || null;
    } catch {
      return null;
    }
  }
}

async function signUpUser(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({ email, password }, { data: { display_name: displayName || '' } });
  return { data, error };
}

async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signIn({ email, password });
  return { data, error };
}

async function signInWithProvider(provider) {
  // Redirect to provider auth
  return await supabase.auth.signIn({ provider });
}

async function signOutUser() {
  const { data, error } = await supabase.auth.signOut();
  return { data, error };
}

// Backing wrappers used in pages
async function loginUser(email, password) {
  return await signInUser(email, password);
}
async function signUpUser(email, password, displayName) {
  // note: displayName goes into the user metadata via the data param
  const { data, error } = await supabase.auth.signUp(
    { email, password },
    { data: { display_name: displayName || '' } }
  );
  return { data, error };
}
async function signInWithProvider(provider) {
  return await supabase.auth.signIn({ provider });
}
