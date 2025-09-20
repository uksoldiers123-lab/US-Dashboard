
// Replace placeholders with your real endpoints/keys in production.

// 1) Supabase setup (inline for dev; switch to env-based in prod)
const SUPABASE_URL = "https://gifguoyqccozlijrxgcf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbHRyY2FlaHBzaGt3Z2FubGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NjM0NzMsImV4cCI6MjA3MDQzOTQ3M30.8CLBXrknu3kea7OMdJKOBSNayXBOu3lJFu_H4PqI0vg"; // replace with real anon key

function createSupabaseClient(url, key) {
  if (window && window.supabase && typeof window.supabase.createClient === "function") {
    return window.supabase.createClient(url, key);
  }
  // Lightweight fallback for this standalone file (dev-only)
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "dev-user",
            user_metadata: {
              name: "Dev Client",
              business_id: "BUS-DEV",
              onboarding_complete: false,
              role: "user_connect" // or "user"
            }
          }
        },
        error: null
      }),
      signOut: async () => {}
    },
    from: () => ({
      select: async () => ({ data: [], error: null }),
      insert: async () => ({ data: [], error: null }),
      update: async () => ({ data: [], error: null }),
      delete: async () => ({ data: [], error: null })
    })
  };
}
const sb = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2) Helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function show(el) { if (el) el.style.display = ""; }
function hide(el) { if (el) el.style.display = "none"; }

// 3) State
let currentUser = null;
let unreadCount = 0;

// 4) Init flow
(async function initDashboard() {
  // Get user from Supabase real-time auth (or fallback mock)
  try {
    const { data } = await sb.auth.getUser();
    currentUser = data?.user || {
      id: "guest",
      user_metadata: { name: "Guest", business_id: "", onboarding_complete: false, role: "user_connect" }
    };
  } catch (e) {
    currentUser = {
      id: "guest",
      user_metadata: { name: "Guest", business_id: "", onboarding_complete: false, role: "user_connect" }
    };
  }

  // Greeting: "Welcome, <Name> (Business ID: <id>)"
  const name = currentUser.user_metadata?.name || "Client";
  const biz = currentUser.user_metadata?.business_id || currentUser.user_metadata?.businessId || "";
  const greetingEl = document.getElementById("clientGreeting");
  if (greetingEl) {
    greetingEl.textContent = `Welcome, ${name}${biz ? ` (Business ID: ${biz})` : ""}!`;
  }

  // Onboarding vs Dashboard
  const role = currentUser.user_metadata?.role || "user";
  const onboardingComplete = !!currentUser.user_metadata?.onboarding_complete;
  const onboardPanel = document.getElementById("onboardArea");
  if (onboardPanel) {
    const shouldShowOnboard = (role === "user_connect" || role === "connect_user") && !onboardingComplete;
    onboardPanel.style.display = shouldShowOnboard ? "" : "none";
  }

  // Load data
  await loadOverview(currentUser);
  await loadRecentPayments();
  renderCharts();
  setupSearch();
  await loadNotifications(currentUser.id);

  // Bind onboarding start (demo)
  const startBtn = document.getElementById("startOnboarding");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      alert("https://connect.stripe.com/d/setup/s/_T5mDjtu5IdFIoe6WJPyrbv9Qle/YWNjdF8xUzlhZWRRejZJNXY3dDF0/5ea2167524e96f1c5");
      // In production, redirect to Stripe Connect onboarding URL
    });
  }

  // Sign out
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    // Use real sign-out if you have a session
    window.location.href = "login.html";
  });
})();

// 5) Data fetchers (replace with real API calls or Supabase queries)
async function loadOverview(user) {
  const bizId = user?.user_metadata?.business_id || "";
  const bizEl = document.getElementById("business-id");
  if (bizEl) bizEl.textContent = bizId ? `Business ID: ${bizId}` : "";

  // Placeholder balances; replace with real fetch
  document.getElementById("total-balance").textContent = "Total Balance: $1,234.56";
  document.getElementById("available-balance").textContent = "Available for Payout: $1,000.00";
  document.getElementById("pending-balance").textContent = "Pending Balance: $234.56";

  // Greeting line in header (already set in init, ensure consistency)
  const name = user?.user_metadata?.name || "Client";
  const biz2 = bizId || "";
  const greet = document.getElementById("clientGreeting");
  if (greet) greet.textContent = `Welcome, ${name}${biz2 ? ` (Business ID: ${biz2})` : ""}!`;
}

async function loadRecentPayments() {
  const tbody = document.querySelector("#payments-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  // Replace with real fetch
  const rows = [
    { id: "pay_001", invoice: "INV-001", amount: 120, currency: "USD", status: "succeeded", date: "2025-09-15", customer: "ACME", method: "card" },
    { id: "pay_002", invoice: "INV-002", amount: 75, currency: "USD", status: "pending", date: "2025-09-16", customer: "Globex", method: "bank" }
  ];

  if (rows.length) {
    rows.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.invoice}</td>
        <td>$${Number(p.amount).toFixed(2)}</td>
        <td>${p.currency}</td>
        <td>${p.status}</td>
        <td>${new Date(p.date).toLocaleDateString()}</td>
        <td>${p.customer}</td>
        <td>${p.method}</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 8;
    td.textContent = "No payments found";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

// 6) Charts (Chart.js)
function renderCharts() {
  // Revenue over time (line)
  const ctxRev = document.getElementById("revenueChart").getContext("2d");
  new Chart(ctxRev, {
    type: "line",
    data: {
      labels: ["2025-09-01","2025-09-05","2025-09-10","2025-09-15","2025-09-20"],
      datasets: [{
        label: "Revenue",
        data: [200, 400, 350, 520, 610],
        borderColor: "#e34b4b",
        backgroundColor: "rgba(227,75,75,.15)",
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { type: "time", time: { unit: "day" } },
        y: { beginAtZero: true }
      }
    }
  });

  // Payments by status (donut)
  const ctxStatus = document.getElementById("paymentsStatusChart").getContext("2d");
  new Chart(ctxStatus, {
    type: "doughnut",
    data: {
      labels: ["Succeeded","Pending","Failed"],
      datasets: [{ data: [40, 10, 5], backgroundColor: ["#10b981", "#f59e0b", "#ef4444"] }]
    },
    options: { maintainAspectRatio: false }
  });

  // Payouts over time
  const ctxPayouts = document.getElementById("payoutsChart").getContext("2d");
  new Chart(ctxPayouts, {
    type: "line",
    data: {
      labels: ["2025-09-01","2025-09-05","2025-09-10","2025-09-15","2025-09-20"],
      datasets: [{
        label: "Payouts",
        data: [50, 100, 80, 120, 160],
        borderColor: "#f59e0b",
        fill: false
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: { x: { type: "time", time: { unit: "day" } }, y: { beginAtZero: true } }
    }
  });

  // Transfers
  const ctxTransfers = document.getElementById("transfersChart").getContext("2d");
  new Chart(ctxTransfers, {
    type: "bar",
    data: {
      labels: ["Mon","Tue","Wed","Thu","Fri"],
      datasets: [{ label: "Transfers", data: [8,12,6,9,11], backgroundColor: "#3b82f6" }]
    },
    options: { maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
  });
}

// 7) Search
function setupSearch() {
  const search = document.getElementById("global-search");
  const results = document.getElementById("search-results");
  if (!search || !results) return;
  search.addEventListener("input", () => {
    const q = search.value.trim();
    if (!q) { results.style.display = "none"; results.innerHTML = ""; return; }
    const items = [
      { type: "Payment", id: "pay_001", text: `Payment ${q} - INV-001` },
      { type: "User", id: "u_123", text: `User ${q} - john@example.com` }
    ];
    results.innerHTML = items.map((it) => `<div class="notif-item" data-id="${it.id}" data-type="${it.type}">${it.type}: ${it.text}</div>`).join("");
    results.style.display = "block";
    results.querySelectorAll(".notif-item").forEach((el) =>
      el.addEventListener("click", () => {
        // Implement navigation to detail if needed
        results.style.display = "none";
      })
    );
  });
}

// 8) Notifications
async function loadNotifications(userId) {
  const panel = document.getElementById("notif-panel");
  if (!panel) return;

  // Example: fetch real notifications from Supabase or REST
  // For now, mock
  const notifList = document.getElementById("notif-list");
  const items = [
    { id: "n1", message: "Payment of $120.00 succeeded", is_read: false, created_at: "2025-09-15T12:00:00Z" },
    { id: "n2", message: "Payout of $50.00 completed", is_read: true, created_at: "2025-09-14T09:00:00Z" }
  ];
  notifList.innerHTML = "";
  const unread = items.filter((i) => !i.is_read).length;
  unreadCount = unread;
  const badge = document.getElementById("notifCount");
  if (unread > 0) { badge.textContent = unread; badge.style.display = "inline-block"; } else { badge.style.display = "none"; }

  items.forEach((n) => {
    const div = document.createElement("div");
    div.className = "notif-item" + (n.is_read ? "" : " unread");
    div.textContent = `${n.message} • ${new Date(n.created_at).toLocaleString()}`;
    notifList.appendChild(div);
  });
}

// 9) Onboarding actions (demo)
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "startOnboarding") {
    alert("Begin onboarding flow (Stripe Connect) – replace with real URL.");
  }
});

// 10) Page wiring for end-to-end
(function wireEndToEnd() {
  // Ensure notification badge is wired to click
  const notifBtn = document.getElementById("notifBtn") || document.getElementById("notifBtn");
  const notifPanel = document.getElementById("notif-panel");
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener("click", () => {
      notifPanel.style.display = notifPanel.style.display === "block" ? "none" : "block";
    });
  }
  // Mark all read (demo)
  const markAll = document.getElementById("mark-all-read");
  if (markAll) markAll.addEventListener("click", () => {
    // In production, mark all as read in DB
    const items = document.querySelectorAll(".notif-item.unread");
    items.forEach((it) => it.classList.remove("unread"));
  });
})();

// Initialize a safe setup after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // The init() flow is already started in the IIFE above
});
