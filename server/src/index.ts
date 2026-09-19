import express from "express";
import cors from "cors";
import { config } from "./config";
import { pool } from "./db/pool";
import authRoutes from "./routes/auth.routes";
import collectionRoutes from "./routes/collections.routes";
import notificationRoutes from "./routes/notifications.routes";
import shareRoutes from "./routes/share.routes";
import { errorHandler } from "./middleware/errorHandler";
import searchRoutes from './routes/search.routes.js';

const app = express();

// Allow the Vite dev server to call this API
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

// Health-check route to confirm frontend <-> backend connection
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Confirms the database is reachable and the schema was applied
app.get("/api/db-check", async (_req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM users");
    res.json({ ok: true, users: Number(result.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database unavailable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/share", shareRoutes);
app.use('/api/search', searchRoutes);

// Must be registered after all routes
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});