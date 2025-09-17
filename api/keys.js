
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

// Keys from env/.env
const KEYS = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY
};

// Basic CORS for demo; tighten in prod
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/keys', (req, res) => {
  res.json(KEYS);
});

app.listen(port, () => {
  console.log(`Keys API listening on http://localhost:${port}`);
});
