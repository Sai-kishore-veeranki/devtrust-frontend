# DevTrust Frontend

> React dashboard for DevTrust — real-time incident feed, service dependency graph, DORA metrics, and AI-powered root cause analysis.

---

## Overview

This is the frontend for [DevTrust](https://github.com/Sai-kishore-veeranki/devtrust), an engineering intelligence platform that correlates production anomalies with deployments in real time.

The dashboard connects to the Spring Boot backend via REST API on page load and WebSocket (STOMP over SockJS) for live incident updates — no polling, no manual refresh.

---

## Features

- **Live incident feed** — incident cards appear in real time the moment a correlation is detected, then update in place when the AI root cause analysis arrives
- **Blast radius display** — every incident card shows estimated revenue lost, users affected, duration, and SLA breach status
- **Service dependency graph** — interactive D3.js graph showing service health, dependencies, and incident history per node
- **DORA metrics dashboard** — deployment frequency, change failure rate, and MTTR computed from real data, filterable by time period

---

## Tech Stack

| Thing | Version |
|---|---|
| React | 18 |
| Vite | 6 |
| D3.js | 7 |
| STOMP.js | @stomp/stompjs |
| SockJS | sockjs-client |
| Axios | latest |

---

## Getting Started

### Prerequisites

- Node.js 18+
- DevTrust backend running on `localhost:8080`

### Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Build for production

```bash
npm run build
```

---

## Environment Variables

Create a `.env.production` file for deployment:

```env
VITE_API_BASE=https://your-backend-url/api
VITE_WS_BASE=https://your-backend-url/ws
```

For local development these default to `http://localhost:8080` — no `.env` file needed.

---

## Project Structure

```
src/
├── components/
│   ├── IncidentCard.jsx     # Individual incident card with cost + AI data
│   ├── IncidentFeed.jsx      # Live WebSocket-connected incident list
│   ├── DoraMetrics.jsx       # Engineering health metric cards
│   └── ServiceGraph.jsx      # D3.js interactive dependency graph
├── services/
│   ├── api.js                # REST API calls (axios)
│   └── websocket.js          # STOMP WebSocket connection
└── App.jsx                   # Root component
```

---

## Connecting to the Backend

The frontend expects the DevTrust Spring Boot backend at `http://localhost:8080`. Make sure it's running before starting the dev server. See the [backend README](https://github.com/Sai-kishore-veeranki/devtrust) for setup instructions.

---

