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

For deployment, set `DATABASE_URL`, `SESSION_SECRET`, `CORS_ORIGINS`, and the frontend build variables `REACT_APP_API_URL`, `REACT_APP_DASHBOARD_URL`, and `REACT_APP_FRONTEND_URL` to the deployed HTTPS origins. Enable `DATABASE_SSL` when required by the database provider. Use `COOKIE_SECURE=true` in production; set `COOKIE_SAME_SITE=none` only when the frontend and API are on different sites, and enable `TRUST_PROXY=true` behind a TLS-terminating proxy.