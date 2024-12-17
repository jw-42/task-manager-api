import type { Context, Next } from "hono";
import { createFactory } from "hono/factory";
import { createHmac } from "crypto";
import prisma from "../../prisma";
import { sign } from "hono/jwt";

import { ApiError } from "../../error/ApiError";
import { LaunchParamsSchema } from "../../schemes";

const factory = createFactory();

const checkVKLaunchParams = factory.createHandlers(
  async (ctx: Context, next: Next) => {
    const body = await ctx.req.json();

    const schema = LaunchParamsSchema;
    
    try {
      const result = schema.safeParse(body);

      if (result.success) {
        if (!isValidParams(result.data)) {
          throw ApiError.forbidden("Invalid launch params");
        }

        let user = await prisma.user.findUnique({
          where: {
            id: result.data.vk_user_id
          }
        });

        if (user === null) {
          user = await prisma.user.create({
            data: {
              id: result.data.vk_user_id
            }
          });
        }

        const date = new Date();
        date.setHours(date.getHours() + 1);

        const access_token = await prisma.token.create({
          data: {
            token: await sign(
              {
                uid: user.id,
                exp: date.getTime()
              },
              `${Bun.env.ACCESS_TOKEN_SECRET}`
            ),
            type: "access",
            user_id: user.id,
            expire_at: date
          },
          select: {
            token: true
          }
        });

        if (access_token === null) {
          throw ApiError.internal("Can't auth, try again later");
        }

        return ctx.json({
          access_token: access_token.token
        });
      } else {
        return ctx.json({
          error: result.error
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        console.error(error);
        throw ApiError.internal();
      }
    }
  }
);

export { checkVKLaunchParams };

const isValidParams = (launchParams: any) => {
  let sign: string = "";
  const queryParams: any[] = [];

  const processQueryParam = (key: string, value: any) => {
    if (key === 'sign') {
      sign = value
    } else if (key.startsWith('vk_')) {
      queryParams.push({key, value})
    }
  }

  if (typeof launchParams === 'string') {
    const formattedSearch = launchParams.startsWith('?')
      ? launchParams.slice(1)
      : launchParams;
    for (const param of formattedSearch.split('&')) {
      const [key, value] = param.split('=');
      processQueryParam(key, value);
    }
  } else {
    for (const key of Object.keys(launchParams)) {
      const value = launchParams[key];
      processQueryParam(key, value);
    }
  }

  if (!sign || queryParams.length === 0) {
    return false;
  }

  const queryString = queryParams
    .sort((a, b) => a.key.localeCompare(b.key))
    .reduce((acc, {key, value}, idx) => {
      return acc + (idx === 0 ? '' : '&') + `${key}=${encodeURIComponent(value)}`;
    }, '');

  const paramsHash = createHmac("sha256", `${Bun.env.APP_SECRET}`)
    .update(queryString)
    .digest()
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=$/, '');
  
  return paramsHash === sign;
}