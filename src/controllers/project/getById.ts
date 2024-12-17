import type { Context, Next } from "hono";
import { createFactory } from "hono/factory";
import { ApiError } from "../../error/ApiError";
import prisma from "../../prisma";
import { z } from "zod";

import * as CON from "../../scripts/defaultCondition";

const factory = createFactory();

const getById = factory.createHandlers(
  async (ctx: Context, next: Next) => {
    const body = await ctx.req.json();
    
    const schema = z.object({
      project_id: z.number()
    });

    const result = schema.safeParse(body);
    
    try {
      if (result.success) {

        const { project_id } = result.data;

        const response = await prisma.$transaction(async (tx) => {

          if (!await CON.PROJECT_EXIST(tx, project_id)) {
            throw ApiError.badRequest("project_id");
          }
          
          if (!await CON.IS_PROJECT_MEMBER(tx, project_id, ctx.get("uid"))) {
            throw ApiError.forbidden("can't view this project");
          }

          return await tx.project.findUnique({
            where: { id: project_id },
            select: {
              id: true,
              owner_id: true,
              name: true,
              short_name: true
            }
          });

        });

        if (response === null) {
          throw ApiError.internal();
        }

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

export { getById };