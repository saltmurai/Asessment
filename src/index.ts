import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { app as studentRoutes } from "./routes/student/student.controller.js";

const app = new Hono().basePath("/api");

app.get("/health", (c) => {
  return c.json({
    status: "OK",
  });
});

// Mount student routes at /api
app.route("/", studentRoutes);

app.onError((err, c) => {
  console.error("Error occurred:", err);
  console.error("Context:", c.req.method, c.req.url);
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
