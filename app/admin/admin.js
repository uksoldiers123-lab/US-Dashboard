document.getElementById("adminSignOut").addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/login.html";
});

// Publish notification (admin)
async function publishNotification() {
  const title = document.getElementById("notifTitle").value.trim();
  const message = document.getElementById("notifMessage").value.trim();
  const target = document.getElementById("notifTarget").value;
  const tenantId = document.getElementById("notifTenantId").value.trim() || null;
  const userId = document.getElementById("notifUserId").value.trim() || null;

  if (!title || !message) {
    alert("Please provide a title and message.");
    return;
  }

  try {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, target, tenantId, userId })
    });
    const r = await res.json();
    if (r.success) {
      alert("Notification published.");
      document.getElementById("notifTitle").value = "";
      document.getElementById("notifMessage").value = "";
      document.getElementById("notifTenantId").value = "";
      document.getElementById("notifUserId").value = "";
      // Optional: refresh admin view
      loadAdminNotifications();
    } else {
      alert("Failed: " + r.error);
    }
  } catch (e) {
    console.error(e);
  }
}
document.getElementById("btnCreateNotif").addEventListener("click", (e) => {
  e.preventDefault();
  publishNotification();
});

// Admin search for treasury invoices
document.getElementById("btnAdminSearch").addEventListener("click", (e) => {
  e.preventDefault();
  const q = document.getElementById("adminSearch").value.trim();
  if (q) loadAdminInvoices(q);
});

async function loadAdminInvoices(query) {
  // Replace with actual API call
  const tbody = document.querySelector("#adminInvoicesTable tbody");
  tbody.innerHTML = "";

  // Demo row
  const rows = [
    { invoice: "INV-000-0001", owner: "owner-1", amount: "1200.00", currency: "USD", status: "Paid", date: "2025-08-01" }
  ];
  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.invoice}</td><td>${r.owner}</td><td>${r.amount}</td><td>${r.currency}</td><td>${r.status}</td><td>${r.date}</td>`;
    tbody.appendChild(tr);
  });
}

document.getElementById("openAdminSettings").addEventListener("click", () => {
  alert("Open Admin Settings (modal or route)");
});

window.addEventListener("load", async () => {
  await loadAdminInvoices("");
});
