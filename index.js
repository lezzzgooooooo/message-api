const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORS (fixes browser errors)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"]
}));

app.use(express.json());

// 🔐 Supabase config
const SUPABASE_URL =
  "https://szpqkqrpauzzvlijdhek.supabase.co/rest/v1/messages";

const API_KEY = process.env.SUPABASE_KEY;

// ✅ TEST ROUTE (check if backend is alive)
app.get("/", (req, res) => {
  res.send("API is running");
});

// 📩 SEND MESSAGE
app.post("/send", async (req, res) => {
  const { user_id, message, effect } = req.body;

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  try {
    const response = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
      user_id,
      message,
      ip_address: ip,
      effect
    })
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Supabase insert failed" });
    }

    res.json({ status: "saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// 📥 GET MESSAGES
app.get("/messages", async (req, res) => {
  try {
    const response = await fetch(
      SUPABASE_URL + "?select=*",
      {
        headers: {
          "apikey": API_KEY,
          "Authorization": `Bearer ${API_KEY}`
        }
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "fetch failed" });
  }
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
