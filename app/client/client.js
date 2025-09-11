let SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_PUBLIC_KEY;
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchKeys() {
    const response = await fetch('/api/keys');
    const keys = await response.json();
    SUPABASE_URL = keys.SUPABASE_URL;
    SUPABASE_ANON_KEY = keys.SUPABASE_ANON_KEY;
    STRIPE_PUBLIC_KEY = keys.STRIPE_PUBLIC_KEY;

    // Initialize Supabase client with keys
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

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
}

async function signOut() {
    await sb.auth.signOut();
    window.location.href = "login.html"; // Redirect to login page after signing out
}

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

    // Update user info in Supabase
    const { error } = await sb.auth.update({
        email: email,
        password: password,
        data: { display_name: name, bank: bankInfo, account_number: accountNumber }
    });

    if (error) {
        alert('Error updating settings: ' + error.message);
    } else {
        alert('Settings updated successfully!');
        loadUserData(); // Reload user data to reflect changes
    }
});

// Load user data and keys on page load
window.addEventListener('load', async () => {
    await fetchKeys(); // Fetch keys first
    await loadUserData(); // Then load user data
});
