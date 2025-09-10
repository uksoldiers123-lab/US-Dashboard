
// Centralized redirect logic for login -> dashboard flow
// - If not authenticated, go to login.html
// - If authenticated, determine role and go to AdminDashboard.html or clientdashboard.html
// - Guard against redirect loops (one redirect per page load)
// - Expose a single initializer and a sign-out helper

(function() {
  const ADMIN_DASHBOARD = 'AdminDashboard.html';
  const CLIENT_DASHBOARD = 'clientdashboard.html';
  const LOGIN_PAGE = 'login.html';

  // One-time guard to prevent multiple redirects on a single load
  let _dashboardRedirected = false;

  // Initialize and run the flow
  async function initDashboardLogic() {
    if (_dashboardRedirected) return;

    // Ensure Supabase client exists
    if (!window.supabase || typeof window.supabase.auth.getSession !== 'function') {
      console.warn('Supabase not initialized yet. Retrying...');
      setTimeout(initDashboardLogic, 100);
      return;
    }

    try {
      // Get current session
      const { data: { session } = {} } = await window.supabase.auth.getSession();
      const user = session?.user ?? null;

      // If no authenticated user, redirect to login
      if (!user || !user.id) {
        _dashboardRedirected = true;
        window.location.href = LOGIN_PAGE;
        return;
      }

      // Read role from your users table (adjust as needed)
      let role = null;
      try {
        const { data: userRow } = await window.supabase
          .from('users') // adjust if your table name is different
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (userRow && userRow.role) role = userRow.role;
      } catch (e) {
        console.warn('Could not fetch user role, defaulting to client dashboard:', e);
      }

      // Decide target
      const target = (role && String(role).toLowerCase() === 'admin')
        ? ADMIN_DASHBOARD
        : CLIENT_DASHBOARD;

      // If not on the target, redirect
      const current = (window.location.pathname.split('/').pop() || '').toLowerCase();
      if (current !== target.toLowerCase()) {
        _dashboardRedirected = true;
        window.location.href = target;
      } else {
        _dashboardRedirected = true;
        console.log('Already on the correct dashboard:', target);
        // Optional: keep rendering the dashboard content here
      }
    } catch (err) {
      console.error('Dashboard logic failed:', err);
      _dashboardRedirected = true;
      window.location.href = CLIENT_DASHBOARD;
    }
  }

  // Public trigger (optional, used after login)
  window.initDashboardLogic = initDashboardLogic;

  // Sign-out helper (call on sign out button)
  window.signOutAndRedirect = async function() {
    try {
      if (window.supabase) {
        await window.supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign-out error:', e);
    } finally {
      window.location.href = LOGIN_PAGE;
    }
  };

  // Auto-run on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', initDashboardLogic);
})();
