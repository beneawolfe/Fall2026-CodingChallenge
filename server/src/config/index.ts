import "dotenv/config";

// Read a required environment variable or fail fast at startup
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 5001),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: "7d" as const,
};