
import { SUPABASE, subscribeToUserNotifications } from '../shared/real-time-subs.js';

// Replace with actual user context retrieval
const currentUserId = "USER_ID_PLACEHOLDER";
const currentTenantId = "TENANT_ID_PLACEHOLDER";

document.getElementById("signOutBtn").addEventListener("click", (e) => {
  e.preventDefault();
  // Implement your sign-out flow
  window.location.href = "/login.html";
});

async function loadClientData() {
  // Populate name (example)
  const name = "Client";
  document.getElementById("clientName").textContent = `Welcome back, ${name}`;

  // Load recent invoices (stub)
  const tbody = document.querySelector("#invoicesTable tbody");
  tbody.innerHTML = `
    <tr><td>INV-003-ABCDEF</td><td>INV-003-ABCDEF</td><td>${name}</td><td>100.00</td><td>USD</td><td>Paid</td><td>2025-09-01</td></tr>
  `;
  // real code would fetch from /api/invoices?owner=currentUserId
}

async function loadNotifications() {
  // Use server-side API or real-time subscription (see below)
  // For a starting point, fetch initial new notifications since last view
  const lastSeen = localStorage.getItem("last_notif_seen") || null;
  try {
    const res = await fetch(`/api/notifications?user_id=${encodeURIComponent(currentUserId)}&since=${encodeURIComponent(lastSeen || "")}`);
    const data = await res.json();
    const container = document.getElementById("notifications");
    if (Array.isArray(data.notifications) && data.notifications.length > 0) {
      container.innerHTML = data.notifications.map(n => `<div class="notif"><strong>${n.title}</strong> ${n.message}</div>`).join("");
      const now = new Date().toISOString();
      localStorage.setItem("last_notif_seen", now);
      // Optionally mark as read in backend
    } else {
      container.innerHTML = "<div class='notif'>No new notifications</div>";
    }
  } catch (e) {
    console.error(e);
  }
}

async function initRealtime() {
  // Subscribe to real-time notifications for this user
  const channel = subscribeToUserNotifications(currentUserId, (n) => {
    const container = document.getElementById("notifications");
    const html = `<div class="notif"><strong>${n.title}</strong> ${n.message} <span class="date">${new Date(n.created_at).toLocaleString()}</span></div>`;
    container.insertAdjacentHTML('beforeend', html);
    // Update badge
    const badge = document.getElementById("notificationsCount");
    let count = parseInt(badge.dataset.count || "0", 10) + 1;
    badge.dataset.count = String(count);
    badge.textContent = `Notifications: ${count}`;
  });

  // Return unsubscribe if needed later
  return channel;
}

document.getElementById("btnSearchOwner").addEventListener("click", () => {
  // Implement search by business ID or owner name
  const q = document.getElementById("searchOwner").value.trim();
  if (!q) return;
  // fetch invoices or tenants matching q
  console.log("Search requested for:", q);
});

document.getElementById("startOnboarding").addEventListener("click", () => {
  alert("Starting onboarding flow (hook to backend)");
});

// Transfers
document.getElementById("btnSendTransfer").addEventListener("click", () => {
  const recipientBusinessId = document.getElementById("recipientBusinessId").value.trim();
  const amount = parseFloat(document.getElementById("transferAmount").value);
  if (!recipientBusinessId || isNaN(amount) || amount <= 0) {
    alert("Please provide a valid recipient and amount.");
    return;
  }
  // Call API to perform transfer
  fetch("/api/transfers/tenant-to-tenant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipientBusinessId, amount, currency: "USD" })
  }).then(r => r.json()).then(res => {
    if (res.success) {
      document.getElementById("transferStatus").style.display = "inline-block";
      document.getElementById("transferStatus").textContent = `Transfer queued: ${amount} USD to ${recipientBusinessId}`;
    } else {
      alert("Transfer failed: " + res.error);
    }
  }).catch(console.error);
});

// Invoices search
document.getElementById("btnSearchInvoices").addEventListener("click", () => {
  const query = document.getElementById("invoiceSearch").value.trim();
  if (!query) return;
  // fetch invoices by owner/business id
  fetch(`/api/invoices?owner=${encodeURIComponent(query)}`).then(r => r.json()).then(data => {
    const tbody = document.querySelector("#invoicesTable tbody");
    tbody.innerHTML = "";
    data.invoices?.forEach(iv => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${iv.invoice_id || iv.id}</td><td>${iv.invoice_prefix}-${iv.invoice_suffix}</td><td>${iv.owner || ""}</td><td>${iv.amount}</td><td>${iv.currency}</td><td>${iv.status}</td><td>${iv.created_at}</td>`;
      tbody.appendChild(tr);
    });
  }).catch(console.error);
});

// Init on load
window.addEventListener("load", async () => {
  await loadClientData();
  await loadNotifications();
  await initRealtime();
});
