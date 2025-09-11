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
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Existing signup/login routes remain as-is
// ...

// New protected API route to fetch dashboard data
app.get("/api/dashboard-data", authMiddleware, async (req, res) => {
    const { data, error } = await supabase.from('dashboard').select('*').eq('owner_id', req.user?.sub);
    if (error) return res.status(401).json({ error: error.message });
    res.json({ data, user: req.user });
});

// Endpoint to create a payment intent
app.post("/api/create-payment-intent", authMiddleware, async (req, res) => {
    const { amount } = req.body; // Amount should be in cents
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            // Additional parameters if needed...
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

// Optional: Keep your existing /private route if you want to continue using cookie-based flow
app.get("/private", async (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.redirect("/");

    const { data, error } = await supabase.auth.getUser(token);
    if (error) return res.redirect("/");

    const filePath = path.join(__dirname, "private.html");
    fs.readFile(filePath, "utf8", (err, html) => {
        if (err) {
            console.error("Error: private.html could not be loaded!", err);
            return res.status(500).send("Server error: private.html not found.");
        }
        const modifiedHtml = html.replace("{{userEmail}}", data.user.email);
        res.send(modifiedHtml);
    });
});

app.get("/logout", (req, res) => {
    res.clearCookie("access_token");
    res.redirect("/");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
