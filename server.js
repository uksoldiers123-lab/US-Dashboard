
require('dotenv').config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const { authMiddleware } = require("./authMiddleware"); // Your custom authentication middleware
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with the secret key

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client for server-side use
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // To parse JSON bodies
app.use(cookieParser());
app.use(express.static("public")); 

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html")); // Serve the main HTML file
});

// Endpoint to serve keys to the client
app.get('/api/keys', (req, res) => {
    res.json({
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY, // Only public key
    });
});

// Endpoint to create a payment intent
app.post("/api/create-payment-intent", authMiddleware, async (req, res) => {
    const { amount } = req.body; // Amount should be in cents
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint for tenant-to-tenant payments
app.post("/api/send-payment", authMiddleware, async (req, res) => {
    const { recipientId, amount, currency } = req.body;

    // Ensure you have a valid recipient ID and amount
    if (!recipientId || !amount) {
        return res.status(400).json({ error: 'Invalid payment details' });
    }

    try {
        // Create a transfer in Stripe
        const transfer = await stripe.transfers.create({
            amount: amount * 100, // Convert to cents
            currency,
            destination: recipientId, // Ensure this is the correct Stripe account ID for the recipient
        });

        res.json({ success: true, transfer });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Example protected API route to fetch dashboard data
app.get("/api/dashboard-data", authMiddleware, async (req, res) => {
    const { data, error } = await supabase.from('dashboard').select('*').eq('owner_id', req.user?.sub);
    if (error) return res.status(401).json({ error: error.message });
    res.json({ data, user: req.user });
});

// Logout Route
app.get("/logout", (req, res) => {
    res.clearCookie("access_token");
    res.redirect("/");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
