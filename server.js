const express = require("express");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const { authMiddleware } = require("./authMiddleware"); // new middleware

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client for server-side use if needed
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public")); 

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Existing signup/login routes remain as-is
// ...

// New protected API route (example)
app.get("/api/dashboard-data", authMiddleware, async (req, res) => {
  // Example: fetch something server-side using req.user if needed
  // const { data, error } = await supabase.from('dashboard').select('*').eq('owner_id', req.user?.sub);
  res.json({ data: "secure dashboard data", user: req.user });
});

// Optional: keep your existing /private route if you want to continue using cookie-based flow
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

