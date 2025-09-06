
  // Replace with your real table name and columns
  const table = 'your_table';
  const { data, error } = await supabase.from(table).select('*');
  const dataEl = document.getElementById('data');
  if (error) {
    if (dataEl) dataEl.textContent = 'Error loading data: ' + error.message;
    return;
  }
  if (dataEl) {
    dataEl.textContent = JSON.stringify(data, null, 2);
  }
}

// You can add real-time subscriptions here if you want
