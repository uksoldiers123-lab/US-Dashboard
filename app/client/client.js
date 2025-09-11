let SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_PUBLIC_KEY;
let sb; // Supabase client will be initialized after fetching keys

// Function to fetch keys from the server
async function fetchKeys() {
    const response = await fetch('/api/keys');
    const keys = await response.json();
    SUPABASE_URL = keys.SUPABASE_URL;
    SUPABASE_ANON_KEY = keys.SUPABASE_ANON_KEY;
    STRIPE_PUBLIC_KEY = keys.STRIPE_PUBLIC_KEY;

    // Initialize Supabase client with keys
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Load user data function
async function loadUserData() {
    const { data: user } = await sb.auth.getUser();
    const clientId = user.id;

    // Display user's greeting
    const clientName = user.user_metadata.name || user.user_metadata.businessId || "Client";
    document.getElementById('clientGreeting').textContent = `Welcome, ${clientName}!`;

    // Load balance data
    const balanceResponse = await fetch(`/stripe/${clientId}/balance`);
    const balanceData = await balanceResponse.json();
    document.getElementById('total-balance').textContent = `Total Balance: $${balanceData.total.toFixed(2)}`;
    document.getElementById('available-balance').textContent = `Available for Payout: $${balanceData.available.toFixed(2)}`;

    // Load user settings
    document.getElementById('settings-email').value = user.email;
    document.getElementById('settings-name').value = user.user_metadata.display_name || '';
    document.getElementById('settings-bank').value = user.user_metadata.bank || '';
    document.getElementById('settings-account').value = user.user_metadata.account_number || '';
    document.getElementById('settings-phone').value = user.user_metadata.phone || '';
}

// Sign out function
async function signOut() {
    await sb.auth.signOut();
    window.location.href = "login.html"; // Redirect to login page after signing out
}

// Create payout function
async function createPayout(amount) {
    if (!amount) {
        alert('Please enter a valid amount.');
        return;
    }
    const response = await fetch(`/client/${clientId}/payouts/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'usd' })
    });
    const data = await response.json();
    // Handle payout response here (e.g., show a success message)
    alert(data.message || 'Payout initiated successfully!');
}

// Event listeners
document.getElementById('signOutBtn').addEventListener('click', signOut);
document.getElementById('payout-now').addEventListener('click', async () => {
    const amount = document.getElementById('payout-amount').value;
    await createPayout(amount);
});

document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('settings-email').value;
    const password = document.getElementById('settings-password').value;
    const name = document.getElementById('settings-name').value;
    const bankInfo = document.getElementById('settings-bank').value;
    const accountNumber = document.getElementById('settings-account').value;
    const phoneNumber = document.getElementById('settings-phone').value;

    // Update user info in Supabase
    const { error } = await sb.auth.update({
        email: email,
        password: password,
        data: { display_name: name, bank: bankInfo, account_number: accountNumber, phone: phoneNumber }
    });

    if (error) {
        alert('Error updating settings: ' + error.message);
    } else {
        alert('Settings updated successfully!');
        loadUserData(); // Reload user data to reflect changes
    }
});

// Invoice search functionality
document.getElementById('search-invoices').addEventListener('click', async () => {
    const query = document.getElementById('invoice-search').value.trim();
    if (query) {
        const response = await fetch(`/api/search-invoices?query=${encodeURIComponent(query)}`);
        const invoices = await response.json();
        displayInvoices(invoices);
    } else {
        alert('Please enter a search term.');
    }
});

function displayInvoices(invoices) {
    const paymentsTableBody = document.getElementById('payments-table').getElementsByTagName('tbody')[0];
    paymentsTableBody.innerHTML = ''; // Clear existing content

    invoices.forEach(invoice => {
        const row = paymentsTableBody.insertRow();
        row.insertCell(0).innerText = invoice.id;
        row.insertCell(1).innerText = invoice.invoice || 'N/A'; 
        row.insertCell(2).innerText = (invoice.amount / 100).toFixed(2); 
        row.insertCell(3).innerText = invoice.currency.toUpperCase();
        row.insertCell(4).innerText = invoice.status;
        row.insertCell(5).innerText = new Date(invoice.created * 1000).toLocaleDateString(); 
    });
}

// Load user data and keys on page load
window.addEventListener('load', async () => {
    await fetchKeys(); // Fetch keys first
    await loadUserData(); // Then load user data
});
