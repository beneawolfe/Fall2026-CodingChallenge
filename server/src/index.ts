import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db/pool";

const app = express();
const PORT = process.env.PORT ?? 5001;

// Allow the Vite dev server to call this API
app.use(cors({ origin: "http://localhost:5173" }));
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});