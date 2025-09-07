<script>
  async function signUpUser(email, password, name) {
    // Typical sign-up call
    const { user, session, error } = await window.supabase.auth.signUp({ email, password, options: { data: { display_name: name || '' } } });

    // Return a uniform object to the caller
    return { data: { user, session }, error };
  }

  async function getCurrentUser() {
    // Get the current user if signed in
    const { data, error } = await window.supabase.auth.getUser();
    if (error) return null;
    return data.user;
  }
</script>
