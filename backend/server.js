require("dotenv").config();

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const connectPgSimple = require("connect-pg-simple");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const { Pool } = require("pg");

const PORT = Number(process.env.PORT) || 3002;
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET || (isProduction ? "" : crypto.randomBytes(32).toString("hex"));
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Copy .env.example to .env and configure PostgreSQL.");
  process.exit(1);
}

if (!sessionSecret) {
  console.error("SESSION_SECRET is required in production.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});
const PgSessionStore = connectPgSimple(session);
const app = express();
const cookieName = "zerodha.sid";
const cookieSameSite = process.env.COOKIE_SAME_SITE || "lax";
const cookieSecure = isProduction || process.env.COOKIE_SECURE === "true";

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.includes(origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(session({
  name: cookieName,
  store: new PgSessionStore({ pool, createTableIfMissing: true }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: cookieSameSite,
    secure: cookieSecure,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Sign in to continue." });
  }
  next();
}

function establishSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) return reject(regenerateError);
      req.session.userId = userId;
      req.session.save((saveError) => {
        if (saveError) return reject(saveError);
        resolve();
      });
    });
  });
}

app.get("/health", asyncRoute(async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", database: "connected" });
}));

app.post("/auth/signup", asyncRoute(async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (name.length < 2 || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Enter a name and a valid email address." });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Password must be between 8 and 128 characters." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let user;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, passwordHash],
    );
    user = result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "An account with that email already exists." });
    }
    throw error;
  }

  await establishSession(req, user.id);
  res.status(201).json({ user });
}));

app.post("/auth/login", asyncRoute(async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const result = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email = $1",
    [email],
  );
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Email or password is incorrect." });
  }

  await establishSession(req, user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}));

app.get("/auth/me", requireAuth, asyncRoute(async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [req.session.userId],
  );
  if (!result.rows[0]) {
    return res.status(401).json({ error: "Sign in to continue." });
  }
  res.json({ user: result.rows[0] });
}));

app.post("/auth/logout", asyncRoute(async (req, res) => {
  if (!req.session) return res.sendStatus(204);
  await new Promise((resolve, reject) => {
    req.session.destroy((error) => (error ? reject(error) : resolve()));
  });
  res.clearCookie(cookieName, { httpOnly: true, sameSite: cookieSameSite, secure: cookieSecure });
  res.sendStatus(204);
}));

app.get("/allHoldings", requireAuth, asyncRoute(async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, qty::double precision AS qty, avg::double precision AS avg,
            price::double precision AS price, net, day, is_loss AS "isLoss"
     FROM holdings WHERE user_id = $1 ORDER BY id`,
    [req.session.userId],
  );
  res.json(result.rows);
}));

app.get("/allPositions", requireAuth, asyncRoute(async (req, res) => {
  const result = await pool.query(
    `SELECT id, product, name, qty::double precision AS qty, avg::double precision AS avg,
            price::double precision AS price, net, day, is_loss AS "isLoss"
     FROM positions WHERE user_id = $1 ORDER BY id`,
    [req.session.userId],
  );
  res.json(result.rows);
}));

app.get("/allOrders", requireAuth, asyncRoute(async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, qty, price::double precision AS price, mode, created_at
     FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.session.userId],
  );
  res.json(result.rows);
}));

app.post("/newOrder", requireAuth, asyncRoute(async (req, res) => {
  const { name, qty, price, mode } = req.body;
  const quantity = Number(qty);
  const orderPrice = Number(price);

  if (typeof name !== "string" || !name.trim() || !Number.isSafeInteger(quantity) || quantity <= 0 ||
      !Number.isFinite(orderPrice) || orderPrice < 0 || !["BUY", "SELL"].includes(mode)) {
    return res.status(400).json({ error: "Invalid order details." });
  }

  const result = await pool.query(
    `INSERT INTO orders (user_id, name, qty, price, mode)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, qty, price::double precision AS price, mode, created_at`,
    [req.session.userId, name.trim(), quantity, orderPrice, mode],
  );
  res.status(201).json(result.rows[0]);
}));

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: "The server could not complete the request." });
});

async function startServer() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}; PostgreSQL connected.`);
  });
}

startServer().catch((error) => {
  console.error("Could not start the backend:", error.message);
  process.exit(1);
});