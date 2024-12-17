import type { Context, Next } from "hono";
import { createFactory } from "hono/factory";
import { ApiError } from "../../error/ApiError";
import prisma from "../../prisma";
import { z } from "zod";

import * as CON from "../../scripts/defaultCondition";

const factory = createFactory();

const getMembers = factory.createHandlers(
  async (ctx: Context, next: Next) => {
    const body = await ctx.req.json();
    
    const schema = z.object({
      project_id: z.number(),
      count: z.number().min(1).optional(),
      offset: z.number().min(0).optional()
    });

    const result = schema.safeParse(body);
    
    try {
      if (result.success) {

        const { project_id, count, offset } = result.data;

        const response = await prisma.$transaction(async (tx) => {

          if (!await CON.PROJECT_EXIST(tx, project_id)) {
            throw ApiError.badRequest("project_id");
          }

          if (!await CON.IS_PROJECT_MEMBER(tx, project_id, ctx.get("uid"))) {
            throw ApiError.forbidden("can't view members in this project");
          }

          const count = await tx.projectMember.count({
            where: { project_id: result.data.project_id }
          });

          const items = await tx.projectMember.findMany({
            where: { project_id: result.data.project_id },
            select: {
              user_id: true,
              role: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            take: count ? count <= 100 ? count : 100 : 10,
            skip: offset ?? 0
          });

          return {
            count,
            items
          }
        });

        return ctx.json({ response });
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

export { getMembers };