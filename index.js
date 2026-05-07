const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 secret values (we will set them in Render)
const SUPABASE_URL = "https://szpqkqrpauzzvlijdhek.supabase.co/rest/v1/messages";
const API_KEY = process.env.SUPABASE_KEY;

// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// send message
app.post("/send", async (req, res) => {
  const { user_id, message } = req.body;

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  try {
    await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        user_id,
        message,
        ip_address: ip
      })
    });

    res.json({ status: "saved" });
  } catch (err) {
    res.status(500).send("error");
  }
});

// get messages
app.get("/messages", async (req, res) => {
  const response = await fetch(SUPABASE_URL + "?select=*", {
    headers: {
      "apikey": API_KEY,
      "Authorization": `Bearer ${API_KEY}`
    }
  });

  const data = await response.json();
  res.json(data);
});

app.listen(process.env.PORT || 3000);
