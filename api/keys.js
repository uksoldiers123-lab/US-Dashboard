
// Simple Express server that exposes public keys for the frontend.
// Do not expose any secrets here. Only public keys (SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_PUBLIC_KEY).

const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

// Load from environment (or .env via dotenv in development)
const KEYS = {
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://gifguoyqccozlijrxgcf.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZmd1b3lxY2NvemxpanJ4Z2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTg2MzUsImV4cCI6MjA3MjE5NDYzNX0.gwZnr8fKE7qXuLi8B5Merul3cVAXZ1r6SaWEUoAJWX0',
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY || 'pk_live_51Rv1X3By3HHUeuve2mwl2HJqUYgFuSa2xWM6AwjbcM10Ts6jqdsrtT5RZ9DkK754BEHQ68jqKZ0w0N32zQHLT9Xr007tOweb2G'
};

// CORS: allow your GH Pages domain or any for local testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // adjust in prod
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/keys', (req, res) => {
  res.json(KEYS);
});

app.listen(port, () => {
  console.log(`Keys API listening on http://localhost:${port}`);
});
