async function fetchDashboardData() {
  // Example: fetch rows from a table named 'tasks'
  const { data, error } = await window.supabase
    .from('tasks')
    .select('id, title, status')
    .order('id', { ascending: true });

  if (error) {
    console.error('Dashboard data error:', error);
    return [];
  }
  return data || [];
}

// Call this after ensuring user is signed in
async function renderDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const items = await fetchDashboardData();
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  container.innerHTML = '';
  if (items.length === 0) {
    container.textContent = 'No items to display.';
    return;
  }
  const ul = document.createElement('ul');
  items.forEach(it => {
    const li = document.createElement('li');
    li.textContent = `${it.id}: ${it.title} [${it.status}]`;
    ul.appendChild(li);
  });
  container.appendChild(ul);
}
