# DevTrust Frontend

The DevTrust frontend is a React dashboard for monitoring production health. It combines a service dependency graph, DORA metrics, and a live incident feed with AI-assisted root cause information.

The frontend is designed to run alongside the [DevTrust backend](https://github.com/Sai-kishore-veeranki/devtrust), a Spring Boot service that provides the REST API and WebSocket events.

## What It Does

- Shows service health and dependencies in an interactive D3 graph.
- Displays deployment frequency, change failure rate, and mean time to recovery.
- Loads recent incidents and their blast-radius information.
- Receives new incidents in real time through STOMP over SockJS.
- Provides login and first-time administrator setup through the backend.

## Requirements

- Node.js 18 or newer
- npm
- A running DevTrust backend on `http://localhost:8080`

Check the backend repository for database, AI service, and server setup requirements.

## Run Locally

From the project directory:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite server uses port `5173` and will fail to start if that port is already occupied.

On the first visit, the login screen checks the backend setup status. If no administrator exists, it shows the account creation form. Otherwise, sign in with an existing backend user.

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create an optimized production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

## Backend Connection

The current frontend source uses these backend URLs:

| Purpose | URL |
| --- | --- |
| REST API | `http://localhost:8080/api` |
| Incident WebSocket | `http://localhost:8080/ws` |
| Incident topic | `/topic/incidents` |

The REST client calls these endpoints:

- `GET /api/auth/setup-status`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/incidents`
- `GET /api/dora?days=<number>`
- `GET /api/graph`

If the backend runs somewhere other than `localhost:8080`, update the API base URL in `src/services/api.js` and `src/auth/AuthContext.jsx`, and update the WebSocket URL in `src/services/websocket.js`. `VITE_API_BASE` and `VITE_WS_BASE` are not wired into the current source yet, so adding them to an `.env` file alone will not change the connection target.

## How the Dashboard Works

1. `AuthContext` restores a saved JWT from browser storage and checks whether the backend is reachable.
2. After login, the protected dashboard renders the service graph, DORA metrics, and incident feed.
3. The dashboard fetches its initial data from the REST API.
4. The incident feed opens a SockJS/STOMP connection and subscribes to `/topic/incidents`.
5. New incident messages are added to the feed without a page refresh.

## Project Structure

```text
src/
├── App.jsx                 # Routes and protected dashboard shell
├── auth/
│   ├── AuthContext.jsx     # JWT session and authentication API calls
│   ├── AuthLayout.jsx      # Shared authentication page layout
│   ├── LoginPage.jsx       # Login and first-run setup form
│   └── RegisterPage.jsx    # Registration page
├── components/
│   ├── DoraMetrics.jsx     # DORA metric cards and time filters
│   ├── IncidentCard.jsx    # Incident details and blast radius
│   ├── IncidentFeed.jsx    # Initial incident list and live updates
│   └── ServiceGraph.jsx    # D3 service dependency graph
└── services/
	├── api.js              # Incident, DORA, and graph REST calls
	└── websocket.js        # STOMP over SockJS connection
```

## Troubleshooting

**The login page says it cannot reach the backend**

Confirm that the Spring Boot backend is running on port `8080`, then refresh the page. Also check the browser console for a CORS error.

**The dashboard loads but no incidents appear**

The initial list comes from `GET /api/incidents`; verify that endpoint returns data. Live updates require the backend WebSocket endpoint and `/topic/incidents` subscription to be available.

**The frontend will not start**

Run `npm install` again and check whether another process is using port `5173`. The Vite configuration uses `strictPort: true`, so it does not automatically choose a different port.

**The production build works locally but not after deployment**

Ensure the deployed frontend can reach the backend over the correct protocol (`https`/`wss` where required), configure backend CORS for the frontend origin, and replace the hardcoded local URLs described above.

