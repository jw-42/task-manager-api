import { config } from "dotenv";
import { Hono } from "hono";
import { serve } from "bun";

import { ApiError } from "./error/ApiError";
import { ErrorHandlerMiddleware } from "./middleware";
import prisma from "./prisma";
import { Router } from "./routes";
import { createDefaultRoles, createDefaultUsers } from "./scripts/createDefaultData";

if (process.env.NODE_ENV === "production") {
  config({ path: ".env.production.local" });
} else {
  config({ path: ".env.development.local" });
}

const app = new Hono().basePath("/api");
const port = Number(process.env.PORT) ?? 3000;

app.route("/", Router);

app.notFound(() => {
  throw ApiError.notFound();
});

app.onError(ErrorHandlerMiddleware);

async function main() {
  try {
    await createDefaultRoles();
    await createDefaultUsers();

    serve({
      fetch: app.fetch,
      port,
    });
  } catch (error) {
    console.error(error);
  }
}

main().then(() => console.log(`Server is running on port ${port}`));

export { app };
