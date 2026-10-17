# Backend setup

The backend uses PostgreSQL. Create a database named `zerodha` in PostgreSQL, then configure the connection:

```powershell
Copy-Item .env.example .env
```

Set `DATABASE_URL` in `.env` to the PostgreSQL connection URL for that database, and replace `SESSION_SECRET` with a long random value. Install and start the API:

```powershell
npm install
npm start
```

The API creates its tables from `schema.sql` when it starts. The PostgreSQL database itself must already exist. Check the connection at `http://localhost:3002/health`.

The API does not start listening until PostgreSQL accepts the configured connection. If the dashboard reports that the backend is unavailable, check the backend terminal for the database error. `ECONNREFUSED` usually means the host or port is wrong; `password authentication failed` means the database credentials are wrong. In this workspace PostgreSQL listens on port `5432`, so make sure `DATABASE_URL` targets that port and uses a valid database username and password. A `DATABASE_URL` already set in the terminal environment takes precedence over `.env`.

In PowerShell, configure the URL for the current terminal session, then start the API:

```powershell
$env:DATABASE_URL = "postgresql://<db-user>:<db-password>@127.0.0.1:5432/zerodha"
npm start
```

BUY and SELL orders update the user's demo cash balance and holdings in the same database transaction as the order history. The Funds page only simulates adding and withdrawing demo cash; it does not process real payments. Watchlist prices are static sample quotes, not live market data.

For deployment, set `DATABASE_URL`, `SESSION_SECRET`, `CORS_ORIGINS`, and the frontend build variables `REACT_APP_API_URL`, `REACT_APP_DASHBOARD_URL`, and `REACT_APP_FRONTEND_URL` to the deployed HTTPS origins. Enable `DATABASE_SSL` when required by the database provider. Use `COOKIE_SECURE=true` in production; set `COOKIE_SAME_SITE=none` only when the frontend and API are on different sites, and enable `TRUST_PROXY=true` behind a TLS-terminating proxy.