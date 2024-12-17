import type { Context, Next } from "hono";
import { createFactory } from "hono/factory";
import { ApiError } from "../../error/ApiError";
import prisma from "../../prisma";
import { z } from "zod";

const factory = createFactory();

const getAll = factory.createHandlers(
  async (ctx: Context, next: Next) => {
    const body = await ctx.req.json();
    
    const schema = z.object({
      owner_id: z.number().min(1),
      count: z.number().min(1).optional(),
      offset: z.number().min(0).optional()
    });

    const result = schema.safeParse(body);
    
    try {
      if (result.success) {
        const where = {
          owner_id: result.data.owner_id
        };

        const projects = await prisma.project.findMany({
          where,
          select: {
            id: true,
            name: true,
            short_name: true
          },
          take: result.data.count ?? 10,
          skip: result.data.offset ?? 0
        });

        return ctx.json({
          response: {
            count: await prisma.project.count({ where }),
            items: projects
          }
        });
      } else {
        throw ApiError.badRequest(`[${result.error.errors[0].path}] ${result.error.errors[0].message}`);
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

export { getAll };