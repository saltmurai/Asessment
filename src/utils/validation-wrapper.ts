import type { z } from "zod";
import type { ValidationTargets } from "hono";
import { zValidator as zv } from "@hono/zod-validator";

export const zValidator = <
  T extends z.ZodTypeAny,
  Target extends keyof ValidationTargets
>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      // rethrow the Zod validation error to be handled by Hono's error handler
      throw result.error;
    }
  });
