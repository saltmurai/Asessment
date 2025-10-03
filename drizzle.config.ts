import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: String(process.env.DB_HOST),
    user: String(process.env.DB_USER),
    port: Number(process.env.DB_PORT),
    password: String(process.env.DB_PASSWORD),
    database: String(process.env.DB_NAME),
  },
} satisfies Config;
