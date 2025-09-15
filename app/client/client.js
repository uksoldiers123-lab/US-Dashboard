let SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_PUBLIC_KEY
let sb; // Supabase client will be initialized after fetching keys
let clientId; // Store user ID to use in payments and other functions

// Function to fetch keys from the server
async function fetchKeys() {
    document.getElementById('status-bar').style.display = 'block'; // Show the status bar
    const response = await fetch('/api/keys');
    const keys = await response.json();
    SUPABASE_URL = keys.SUPABASE_URL;
    SUPABASE_ANON_KEY = keys.SUPABASE_ANON_KEY;
    STRIPE_PUBLIC_KEY = keys.STRIPE_PUBLIC_KEY;

    // Initialize Supabase client with keys
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    document.getElementById('status-bar').style.display = 'none'; // Hide the status bar
}

// Load user data function
async function loadUserData() {
    const { data: user, error } = await sb.auth.getUser();
    if (error) {
        console.error('Error fetching user:', error.message);
        return;
    }
    clientId = user.id; // Store user ID

    // Display user's greeting
    const clientName = user.user_metadata.name || user.user_metadata.businessId || "Client";
    document.getElementById('clientGreeting').textContent = `Welcome, ${clientName}!`;

    // Load balance data (assuming you have an API endpoint to get balance)
    const balanceResponse = await fetch(`/stripe/${clientId}/balance`);
    const balanceData = await balanceResponse.json();
    
    // Display balances
    document.getElementById('total-balance').textContent = `Total Balance: $${balanceData.total.toFixed(2)}`;
    document.getElementById('available-balance').textContent = `Available for Payout: $${balanceData.available.toFixed(2)}`;
    document.getElementById('pending-balance').textContent = `Pending Balance: $${balanceData.pending.toFixed(2)}`;

    // Load user settings
    document.getElementById('settings-email').value = user.email;
    document.getElementById('settings-name').value = user.user_metadata.display_name || '';
}

// Send payment to another tenant
async function sendPayment(recipientId, amount) {
    if (!recipientId || !amount) {
        alert('Please enter a valid recipient and amount.');
        return;
    }

    const response = await fetch(`/api/send-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, amount, currency: 'usd' })
    });

    const data = await response.json();
    if (data.success) {
        alert('Payment sent successfully!');
        loadUserData(); // Reload user data to reflect changes
    } else {
        alert('Failed to send payment: ' + data.error);
    }
}

// Event listeners
document.getElementById('signOutBtn').addEventListener('click', async () => {
    await sb.auth.signOut();
    window.location.href = "login.html"; // Redirect to login page after signing out
});

document.getElementById('send-payment').addEventListener('click', async () => {
    const recipientId = document.getElementById('recipient-id').value;
    const amount = document.getElementById('tenant-payment-amount').value;
    await sendPayment(recipientId, amount);
});

// Load user data and keys on page load
window.addEventListener('load', async () => {
    await fetchKeys(); // Fetch keys first
    await loadUserData(); // Then load user data
});
