/**
 * Cloud Service Communication Demo — Backend (Express / Node.js)
 * ----------------------------------------------------------------
 * Architecture (matches the experiment's diagram, with a real backend
 * standing in for the "Google Colab / Python Application" layer):
 *
 *   BROWSER (frontend)
 *        |  HTTP GET / POST
 *        v
 *   EXPRESS SERVER (this file) — the "Cloud Client Application"
 *        |  HTTP GET / POST
 *        v
 *   REST API  ---->  Cloud Service  ---->  JSON Response
 *        |
 *        v
 *   EXPRESS SERVER sends JSON back to the browser
 *
 * Four cloud services are wired up, exactly as in the experiment:
 *   1. Open-Meteo      (GET)  — live weather
 *   2. GitHub API       (GET)  — public developer profile
 *   3. Open Library API (GET)  — book search
 *   4. JSONPlaceholder  (POST) — create a feedback "resource" on the cloud
 */

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Node 18+ has global fetch; kept explicit for older Node

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());               // allow the frontend (different origin/port) to call this API
app.use(express.json());       // parse JSON bodies for POST requests
app.use(express.static("../frontend")); // optionally serve the frontend from the same server

// Small helper so every route follows the same
// "call cloud service -> relay status + JSON" pattern.
async function relay(res, url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    res.status(response.status).json({
      cloudStatusCode: response.status,
      data,
    });
  } catch (err) {
    // Mirrors the experiment's "Fault Injection" activities:
    // network failures, bad hosts, etc. land here.
    res.status(502).json({
      error: "Failed to reach cloud service",
      details: err.message,
    });
  }
}

/* ---------------------------------------------------------------- *
 * 1. WEATHER  — Open-Meteo Cloud Service (GET)
 * GET /api/weather?lat=18.52&lon=73.85
 * ---------------------------------------------------------------- */
app.get("/api/weather", async (req, res) => {
  const lat = req.query.lat || "18.52"; // default: Pune
  const lon = req.query.lon || "73.85";
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`;
  await relay(res, url);
});

/* ---------------------------------------------------------------- *
 * 2. GITHUB  — GitHub REST API Cloud Service (GET)
 * GET /api/github/:username
 * ---------------------------------------------------------------- */
app.get("/api/github/:username", async (req, res) => {
  const { username } = req.params;
  const url = `https://api.github.com/users/${encodeURIComponent(username)}`;
  await relay(res, url, {
    headers: { "User-Agent": "cloud-demo-app" }, // GitHub requires a User-Agent
  });
});

/* ---------------------------------------------------------------- *
 * 3. BOOKS  — Open Library Cloud Service (GET)
 * GET /api/books?q=Cloud Computing
 * ---------------------------------------------------------------- */
app.get("/api/books", async (req, res) => {
  const q = req.query.q || "Cloud Computing";
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}`;
  await relay(res, url);
});

/* ---------------------------------------------------------------- *
 * 4. FEEDBACK  — JSONPlaceholder Cloud Service (POST — creates data)
 * POST /api/feedback   body: { "name": "...", "message": "..." }
 * ---------------------------------------------------------------- */
app.post("/api/feedback", async (req, res) => {
  const { name, message } = req.body;
  const url = "https://jsonplaceholder.typicode.com/posts";
  await relay(res, url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: name || "Anonymous",
      body: message || "",
      userId: 101,
    }),
  });
});

/* ---------------------------------------------------------------- *
 * Health check
 * ---------------------------------------------------------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running", services: ["weather", "github", "books", "feedback"] });
});

app.listen(PORT, () => {
  console.log(`Cloud demo backend running at http://localhost:${PORT}`);
});
