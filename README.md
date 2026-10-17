# Zerodha Demo Trading Project

A multi-package React and Express application for exploring a brokerage-style website and trading dashboard. The app supports account signup/signin, a protected dashboard, database-backed demo orders and funds, and sample market quotes. It does not connect to a broker, execute real trades, or process real payments.

## Project Structure

```text
backend/    Express API, PostgreSQL schema, authentication, and account endpoints
frontend/   Public React site: home, about, products, pricing, support, signup, signin
dashboard/  Protected React app: summary, watchlist, orders, holdings, positions, funds, apps
```

Each folder has its own `package.json`; install and run each app separately.

## Requirements

- Node.js and npm
- PostgreSQL
- A PostgreSQL database named `zerodha`

The API applies `backend/schema.sql` when it starts. Create the database itself before starting the API.

## Configure PostgreSQL

Create a database named `zerodha` using your PostgreSQL administrator account. Then configure the API connection and session secret:

```powershell
Set-Location backend
Copy-Item .env.example .env
```

Edit `backend/.env` and set a valid `DATABASE_URL` and a long random `SESSION_SECRET`. A local connection URL has this form:

```text
postgresql://<db-user>:<db-password>@127.0.0.1:5432/zerodha
```

Use the port and credentials configured for your PostgreSQL installation. A `DATABASE_URL` already set in the process environment takes precedence over `.env`.

## Install Dependencies

Run these commands once from the project root:

```powershell
Set-Location backend
npm install
Set-Location ..\frontend
npm install
Set-Location ..\dashboard
npm install
Set-Location ..
```

## Run Locally

Start PostgreSQL first. Then open three PowerShell terminals from the project root.

**1. Backend API**

```powershell
Set-Location backend
$env:PORT = "3002"
npm start
```

The API is available at `http://localhost:3002`. Confirm its database connection at `http://localhost:3002/health`; a healthy response includes `{"status":"ok","database":"connected"}`.

**2. Dashboard**

```powershell
Set-Location dashboard
$env:PORT = "3000"
$env:REACT_APP_API_URL = "http://localhost:3002"
$env:REACT_APP_FRONTEND_URL = "http://localhost:3001"
npm start
```

Open `http://localhost:3000`.

**3. Public website**

```powershell
Set-Location frontend
$env:PORT = "3001"
$env:REACT_APP_API_URL = "http://localhost:3002"
$env:REACT_APP_DASHBOARD_URL = "http://localhost:3000"
npm start
```

Open `http://localhost:3001`.

Set the `REACT_APP_*` values before starting or building each React app. For deployment, point them to the deployed HTTPS origins instead of localhost.

## Features

- Public site pages for home, about, products, pricing, and support
- Signup and signin with password hashing and server-side session cookies
- Protected dashboard showing the signed-in user's name and initials avatar
- Searchable watchlist with quote details and Buy/Sell order forms
- Per-user order history, holdings, positions, and demo-funds history
- BUY and SELL order processing that updates the order, holdings, and demo cash in a database transaction
- Demo-funds add/withdraw operations with balance checks and transaction history
- Account summary and holdings totals calculated from saved data
- Apps page linking to dashboard sections

Watchlist quotes are static sample data, not live market prices. Adding or withdrawing funds only changes a simulated balance. BUY/SELL actions are demo trading and do not reach a brokerage.

## Data and API

The backend uses PostgreSQL tables for users, holdings, positions, orders, demo balances, demo-funds transactions, and sessions. Account data is scoped to the authenticated user. Tables are created or updated from `backend/schema.sql` during API startup.

Main API routes:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check API and database connectivity |
| `POST` | `/auth/signup` | Create an account and session |
| `POST` | `/auth/login` | Sign in |
| `GET` | `/auth/me` | Read the current session user |
| `POST` | `/auth/logout` | End the session |
| `GET` | `/allHoldings` | Read the signed-in user's holdings |
| `GET` | `/allPositions` | Read the signed-in user's positions |
| `GET` | `/allOrders` | Read the signed-in user's orders |
| `POST` | `/newOrder` | Save and execute a demo BUY/SELL order |
| `GET` | `/funds` | Read demo cash and transaction history |
| `POST` | `/funds/deposit` | Add simulated funds |
| `POST` | `/funds/withdraw` | Withdraw simulated funds |

## Configuration

Backend settings are loaded from the environment or `backend/.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: session signing secret
- `PORT`: API port; defaults to `3002`
- `CORS_ORIGINS`: allowed website/dashboard origins
- `DATABASE_SSL`: set to `true` when required by the database host
- `COOKIE_SECURE`, `COOKIE_SAME_SITE`, `TRUST_PROXY`: session cookie and proxy settings

React apps support `REACT_APP_API_URL`, `REACT_APP_DASHBOARD_URL`, and `REACT_APP_FRONTEND_URL` as applicable.

## Checks

Run a production build for either React app:

```powershell
Set-Location frontend
npm run build

Set-Location ..\dashboard
npm run build
```

Run the available React test scripts with:

```powershell
npm test
```

The backend has no test script currently; `node --check backend/server.js` checks its JavaScript syntax.

## Troubleshooting

The API does not listen on port `3002` unless its PostgreSQL connection succeeds. If the dashboard says it cannot reach the backend:

- `ECONNREFUSED` from the backend usually means the PostgreSQL host or port in `DATABASE_URL` is not listening.
- `password authentication failed` means the database username or password is not accepted by PostgreSQL.
- Check the API terminal output and make sure the API health URL returns HTTP `200` before testing signup, signin, orders, or funds.

In this workspace, the PostgreSQL service was found on port `5432`, while the inherited `DATABASE_URL` pointed to `5433`; trying port `5432` also required correcting the database credentials. No database password is included in this README.
