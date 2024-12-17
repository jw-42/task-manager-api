import type { Context } from "hono";
import { ApiError } from "../error/ApiError";

export const ErrorHandlerMiddleware = async (error: any, ctx: Context) => {
  if (error instanceof ApiError) {
    return ctx.json(
      {
        error_code: error.status,
        error_message: error.message,
      },
      error.status
    );
  } else {
    console.error(error);

    return ctx.json(
      {
        error_code: 500,
        error_message: "Unknown error",
      },
      500
    );
  }
};
