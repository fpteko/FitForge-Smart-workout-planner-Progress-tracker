const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_NINJAS_KEY;

if (!API_KEY) {
  console.warn("Missing API_NINJAS_KEY in .env. Requests to /api/exercises will fail until it is set.");
}

app.use(express.static(path.join(__dirname)));

app.get("/api/exercises", async (req, res) => {
  try {
    const params = new URLSearchParams();

    if (req.query.muscle) params.set("muscle", String(req.query.muscle));
    if (req.query.difficulty) params.set("difficulty", String(req.query.difficulty));

    const upstreamUrl = `https://api.api-ninjas.com/v1/exercises?${params.toString()}`;

    const upstreamResponse = await fetch(upstreamUrl, {
      headers: { "X-Api-Key": API_KEY || "" }
    });

    const bodyText = await upstreamResponse.text();

    res.status(upstreamResponse.status);
    res.type("application/json");
    res.send(bodyText);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`FitForge server running at http://localhost:${PORT}`);
});
