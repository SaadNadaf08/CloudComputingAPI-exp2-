# Cloud Service Communication Demo

A minimal full-stack app demonstrating **Cloud Client Application → REST API → Cloud Service**
communication, using the 4 services from your experiment: Open-Meteo (weather), GitHub API,
Open Library, and JSONPlaceholder.

## Architecture

```
Browser (frontend/index.html)
      | HTTP GET / POST
      v
Express Backend (backend/server.js)   <-- acts as the "Cloud Client Application"
      | HTTP GET / POST
      v
REST API --> Cloud Service --> JSON Response
      |
      v
Backend relays JSON back to the browser
```

## Setup

### 1. Backend (Express)
```bash
cd backend
npm install
npm start
```
This starts the server at **http://localhost:5000**.

### 2. Frontend
Just open `frontend/index.html` directly in your browser
(or serve it with any static server — the backend also serves it automatically
at http://localhost:5000 if you drop the frontend folder next to the backend).

## Endpoints (all proxied through the Express backend)

| Endpoint                     | Method | Cloud Service       | Purpose                        |
|-------------------------------|--------|----------------------|---------------------------------|
| `/api/weather?lat=&lon=`      | GET    | Open-Meteo            | Live weather for coordinates    |
| `/api/github/:username`       | GET    | GitHub REST API       | Public GitHub profile info      |
| `/api/books?q=`               | GET    | Open Library          | Book search                     |
| `/api/feedback`               | POST   | JSONPlaceholder       | Creates a feedback "resource"   |
| `/api/health`                 | GET    | —                     | Backend health check            |

## Why a backend at all?

In the original experiment, Google Colab plays the role of the "Cloud Client Application"
calling REST APIs directly. Here, the **Express backend** plays that same role — it's the
one making the outbound HTTP GET/POST calls to each cloud service — while the **browser
frontend** only ever talks to your own backend. This mirrors how real-world apps
(Swiggy, Amazon, WhatsApp) are structured: the browser/app never calls third-party
cloud APIs directly, it goes through the company's own backend first.
