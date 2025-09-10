async function fetchUserData() {
  try {
    // Adjust based on your actual table and columns
    const { data, error } = await window.supabase.from('user_data').select('id, field, value').order('id', { ascending: true });
    if (error) {
      console.error('Dashboard data error:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Unexpected dashboard data error:', e);
    return [];
  }
}
