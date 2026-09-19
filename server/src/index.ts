import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT ?? 5001;

// Allow the Vite dev server to call this API
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Health-check route to confirm frontend <-> backend connection
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});