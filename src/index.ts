import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { app as studentRoutes } from "./routes/student/student.controller.js";
import z from "zod";
import { fromZodError } from "zod-validation-error";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { DrizzleError, DrizzleQueryError } from "drizzle-orm";

const app = new Hono().basePath("/api");

app.use("*", logger());
app.use("*", cors());

app.get("/health", (c) => {
  return c.json({
    status: "ok",
  });
});

// Mount student routes at /api
app.route("/", studentRoutes);

app.onError((err, c) => {
  if (err instanceof z.ZodError) {
    const validationError = fromZodError(err);
    return c.json(
      {
        message: validationError.message,
      },
      400
    );
  }

  if (err instanceof DrizzleQueryError || err instanceof DrizzleError) {
    return c.json(
      {
        message: "Bad request",
      },
      400
    );
  }

  return c.json(
    {
      message: "Internal Server Error",
    },
    500
  );
});

serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

export default app;
