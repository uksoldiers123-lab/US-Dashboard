
// Replace placeholders with real endpoints/keys in production

// 1) Config (dev fallback)
const SUPABASE_URL = "https://gifguoyqccozlijrxgcf.supabase.co"; // replace in prod
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbHRyY2FlaHBzaGt3Z2FubGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NjM0NzMsImV4cCI6MjA3MDQzOTQ3M30.8CLBXrknu3kea7OMdJKOBSNayXBOu3lJFu_H4PqI0vg"; // replace in prod
let sb; // Supabase client (if using real SDK)
let STRIPE_PUBLIC_KEY = null; // optional usage

// Lightweight mock stub (used if real Supabase not available)
function createClientMock() {
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

// Build or import real Supabase client if available
function initSupabase() {
 if (typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function") {
 return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 }
 // Fallback mock for development
 return createClientMock();
}

sb = initSupabase();

// 2) Helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function show(el) { if (el) el.style.display = ""; }
function hide(el) { if (el) el.style.display = "none"; }

// 3) State
let CURRENT_USER = null;
let UNREAD_NOTIF_COUNT = 0;

// 4) Init flow
async function initDashboard() {
 // Fetch user (prefer real auth if available)
 let user = null;
 try {
 const { data } = await sb.auth.getUser();
 user = data?.user || null;
 } catch (e) {
 console.warn("Using mock user due to error:", e);
 }
 if (!user) {
 user = {
 id: "guest",
 user_metadata: {
 name: "Guest",
 business_id: "",
 onboarding_complete: false,
 role: "user_connect"
 }
 };
 }
 CURRENT_USER = user;

 // Greeting
 const name = user.user_metadata?.name || "Client";
 const bizId = user.user_metadata?.business_id || "";
 const greetingEl = document.getElementById("clientGreeting");
 if (greetingEl) {
 greetingEl.textContent = `Welcome, ${name}${bizId ? ` (Business ID: ${bizId})` : ""}!`;
 }

 // Onboarding vs dashboard view
 const role = user.user_metadata?.role || "user";
 const onboardingComplete = !!user.user_metadata?.onboarding_complete;
 const onboardPanel = document.getElementById("onboardArea");
 if (onboardPanel) {
 const shouldShowOnboard = (role === "user_connect" || role === "connect_user") && !onboardingComplete;
 onboardPanel.style.display = shouldShowOnboard ? "" : "none";
 }

 // Load content
 await loadOverview(user);
 await loadPayments();
 renderCharts();
 setupSearch();
 await loadNotifications(user.id);
}

// 5) Data fetchers (mocked; swap to real API calls)
async function loadOverview(user) {
 await loadPayments();
 renderCharts();
 setupSearch();
 await loadNotifications(user.id);
}

// 5) Data fetchers (mocked; swap to real API calls)
async function loadOverview(user) {
 const biz = user.user_metadata?.business_id || "";
 const greeting = document.getElementById("clientGreeting");
 if (greeting) {
 greeting.textContent = `Welcome, ${user.user_metadata?.name || "Client"}${biz ? ` (Business ID: ${biz})` : ""}!`;
 }
 if (biz) {
 const bizEl = document.getElementById("business-id");
 if (bizEl) bizEl.textContent = `Business ID: ${biz}`;
 }
 // Mock balances; replace with real fetch
 document.getElementById("total-balance")?.textContent = "Total Balance: $1,234.56";
 document.getElementById("available-balance")?.textContent = "Available for Payout: $1,000.00";
 document.getElementById("pending-balance")?.textContent = "Pending Balance: $234.56";
}

async function loadPayments() {
 const tbody = document.querySelector("#payments-tbody");
 if (!tbody) return;
 tbody.innerHTML = "";

 // Mock data; replace with real fetch
 const rows = [
 { id: "pay_001", invoice: "INV-001", amount: 120, currency: "USD", status: "succeeded", date: "2025-09-15", customer: "ACME", method: "card" },
 { id: "pay_002", invoice: "INV-002", amount: 75, currency: "USD", status: "pending", date: "2025-09-16", customer: "Globex", method: "bank" },
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

// 6) Onboarding area actions (example)
document.addEventListener("DOMContentLoaded", () => {
 const signOutBtn = document.getElementById("signOutBtn");
 if (signOutBtn) {
 signOutBtn.addEventListener("click", async () => {
 if (sb && sb.auth && typeof sb.auth.signOut === "function") {
 await sb.auth.signOut();
 }
 window.location.href = "login.html";
 });
 }
 // Start init after DOM is ready
 initDashboard();
});

// 7) Charts (Chart.js)
function renderCharts() {
 // Ensure Chart.js exists
 if (typeof Chart === "undefined") {
 console.warn("Chart.js not loaded. Skipping charts.");
 return;
 }

 // Revenue over time (line)
 const ctx1 = document.getElementById("revenueChart");
 if (ctx1) {
 new Chart(ctx1.getContext("2d"), {
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
 }

 // Payments by status (donut)
 const ctx2 = document.getElementById("paymentsStatusChart");
 if (ctx2) {
 new Chart(ctx2.getContext("2d"), {
 type: "doughnut",
 data: {
 labels: ["Succeeded","Pending","Failed"],
 datasets: [{ data: [40, 10, 5], backgroundColor: ["#10b981", "#f59e0b", "#ef4444"] }]
 },
 options: {
 responsive: true,
 maintainAspectRatio: false
 }
 });
 }
}

// 8) Simple search wiring (stub)
function setupSearch() {
 const qInput = document.getElementById("search-payments");
 if (!qInput) return;
 qInput.addEventListener("input", (e) => {
 const q = e.target.value.toLowerCase().trim();
 // Implement real search against payments API or in-memory cache
 // For now, you can filter the existing table rows as a placeholder
 const rows = document.querySelectorAll("#payments-tbody tr");
 rows.forEach((row) => {
 const text = row.textContent.toLowerCase();
 row.style.display = text.includes(q) ? "" : "none";
 });
 });
}

// 9) Notifications (stubbed)
async function loadNotifications(userId) {
 // Implement real fetch to /notifications for user
 // Update UI badge if you have an element like #notifCount
 const notifEl = document.getElementById("notifCount");
 if (notifEl) notifEl.textContent = "0";
}

// 10) Initialize after DOM is ready
(function bootstrap() {
 // This IIFE ensures the script runs after DOMContentLoaded
 if (document.readyState === "loading") {
 document.addEventListener("DOMContentLoaded", bootstrap);
 return;
 }
 // Optionally load Chart.js if not loaded yet
 // If you’re loading Chart.js via a script tag, ensure it precedes this script.
})();
