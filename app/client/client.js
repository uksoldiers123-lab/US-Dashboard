
// Updated client dashboard script (per-client data, enhanced payments, live tenant search)

let SUPABASE_URL = null;
let SUPABASE_ANON_KEY = null;
let STRIPE_PUBLIC_KEY = null;

let sb = null;           // Supabase client
let clientId = null;       // Auth user id or internal client id
let clientName = '';       // For greeting
let clientBusinessId = ''; // Business ID for the client

// DOM helpers
function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

async function fetchKeys() {
  const statusBar = document.getElementById('status-bar');
  if (statusBar) statusBar.style.display = 'block';
  const res = await fetch('/api/keys');
  const keys = await res.json();
  SUPABASE_URL = keys.SUPABASE_URL;
  SUPABASE_ANON_KEY = keys.SUPABASE_ANON_KEY;
  STRIPE_PUBLIC_KEY = keys.STRIPE_PUBLIC_KEY;

  // Initialize Supabase client
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  if (statusBar) statusBar.style.display = 'none';
}

async function loadUserData() {
  const { data: user, error } = await sb.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error.message);
    return;
  }
  clientId = user.id;
  // Prefer name, then business_id, else "Client"
  clientName = user.user_metadata?.name || '';
  clientBusinessId = user.user_metadata?.business_id || user.user_metadata?.businessId || '';

  const greeting = document.getElementById('clientGreeting');
  if (greeting) {
    greeting.textContent = `Welcome, ${clientName || 'Client'}${clientBusinessId ? ` (Business ID: ${clientBusinessId})` : ''}!`;
  }

  await loadBalanceData();
  await loadPaymentsData();
  // Optional: prepare tenant search UI center
  setupTenantSearchUI();
}

async function loadBalanceData() {
  if (!clientId) return;
  try {
    const r = await fetch(`/stripe/${encodeURIComponent(clientId)}/balance`);
    const data = await r.json();
    document.getElementById('total-balance').textContent = `Total Balance: $${(data.total ?? 0).toFixed(2)}`;
    document.getElementById('available-balance').textContent = `Available for Payout: $${(data.available ?? 0).toFixed(2)}`;
    document.getElementById('pending-balance').textContent = `Pending Balance: $${(data.pending ?? 0).toFixed(2)}`;
  } catch (e) {
    console.error('Failed to load balance data:', e);
  }
}

// 4) Payments panel: per-client payments with extra fields
async function loadPaymentsData() {
  if (!clientId && !clientBusinessId) return;
  // Use server-side filtering if possible
  // Try business_id endpoint first; fallback to client_id if needed
  const endpoint =
    `/payments?business_id=${encodeURIComponent(clientBusinessId || clientId)}`;
  try {
    const resp = await fetch(endpoint);
    const payments = await resp.json();

    const tbody = document.querySelector('#payments-table tbody');
    tbody.innerHTML = '';

    if (Array.isArray(payments) && payments.length) {
      payments.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.id ?? ''}</td>
          <td>${p.invoice ?? ''}</td>
          <td>${p.amount != null ? '$' + Number(p.amount).toFixed(2) : ''}</td>
          <td>${p.currency ?? 'USD'}</td>
          <td>${p.status ?? ''}</td>
          <td>${p.date ? new Date(p.date).toLocaleDateString() : ''}</td>
          <td>${p.customer_name ?? ''}</td>
          <td>${p.payment_method ?? ''}</td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 8;
      td.textContent = 'No payments found';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  } catch (e) {
    console.error('Failed to load payments:', e);
  }
}

// 5) Tenant-to-tenant live search
function setupTenantSearchUI() {
  const input = document.getElementById('recipient-id');
  let resultsBox = document.getElementById('tenant-search-results');
  if (!resultsBox) {
    resultsBox = document.createElement('div');
    resultsBox.id = 'tenant-search-results';
    resultsBox.style.borderTop = '1px solid #eee';
    resultsBox.style.marginTop = '6px';
    document.querySelector('.sidebar')?.appendChild(resultsBox);
  }

  if (input) {
    input.addEventListener('input', async (e) => {
      const q = e.target.value.trim();
      if (!q) {
        resultsBox.innerHTML = '';
        return;
      }
      const r = await fetch(`/tenants/search?query=${encodeURIComponent(q)}`);
      const list = await r.json();
      resultsBox.innerHTML = '';
      if (Array.isArray(list) && list.length) {
        list.forEach(t => {
          const row = document.createElement('div');
          row.className = 'tenant-row';
          row.style.cursor = 'pointer';
          row.textContent = `${t.name || t.email || ''} • ${t.business_id || ''}`;
          row.addEventListener('click', () => {
            // You may want to fill recipient id with internal id or business_id
            input.value = t.id || t.business_id || '';
            resultsBox.innerHTML = '';
          });
          resultsBox.appendChild(row);
        });
      } else {
        resultsBox.textContent = 'No matches';
      }
    });
  }
}

// 6) Sign out
document.getElementById('signOutBtn').addEventListener('click', async () => {
  await sb.auth.signOut();
  window.location.href = 'login.html';
});

// 7) Send payment
async function sendPayment(recipientId, amount) {
  if (!recipientId || !amount) {
    alert('Please enter a valid recipient and amount.');
    return;
  }
  const resp = await fetch('/api/send-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientId, amount: Number(amount), currency: 'usd' })
  });
  const data = await resp.json();
  if (data.success) {
    alert('Payment sent successfully!');
    // Refresh balances and payments to reflect changes
    await loadBalanceData();
    await loadPaymentsData();
  } else {
    alert('Failed to send payment: ' + (data.error ?? 'Unknown error'));
  }
}
document.getElementById('send-payment').addEventListener('click', async () => {
  const recipientId = document.getElementById('recipient-id').value;
  const amount = document.getElementById('tenant-payment-amount').value;
  await sendPayment(recipientId, amount);
});

// 8) Optional: payments search (server-side)
document.getElementById('invoice-search')?.addEventListener('input', async (e) => {
  const term = e.target.value;
  // If you implement server-side search, call /payments/search?client_id=...&q=...
  // For now, you could filter loaded payments in memory if you keep a cache.
});

// 9) Page load orchestration
window.addEventListener('load', async () => {
  await fetchKeys();          // Get keys first
  await loadUserData();         // Then load user data
});
