import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { ApiError } from "../error/ApiError";
import prisma from "../prisma";

export const AuthorizationMiddleware = async (ctx: Context, next: Next) => {

  try {

    const body = await ctx.req.json();

    const AuthorizationHeader = ctx.req.header("Authorization")?.split(" ")[1];
    const AuthorizationToken = body.access_token;
    const token = AuthorizationHeader ?? AuthorizationToken;

    const decodedPayload = await verify(
      token,
      `${Bun.env.ACCESS_TOKEN_SECRET}`
    );

    const date = new Date();

    const verifiedToken = await prisma.token.findFirst({
      where: {
        token: AuthorizationHeader ?? AuthorizationToken,
        type: "access",
        active: true,
        expire_at: {
          gt: date.toISOString()
        }
      }
    });

    if (verifiedToken === null) {
      throw ApiError.forbidden("Token is not defined");
    }

    ctx.set("token", token);
    ctx.set("uid", decodedPayload.uid);

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    } else {
      console.error(error);
      throw ApiError.unauthorized();
    }
  }

  return next();
}