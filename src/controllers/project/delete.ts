import type { Context, Next } from "hono";
import { createFactory } from "hono/factory";
import { ApiError } from "../../error/ApiError";
import prisma from "../../prisma";
import { z } from "zod";

import * as CON from "../../scripts/defaultCondition";

const factory = createFactory();

const deleteProject = factory.createHandlers(
  async (ctx: Context, next: Next) => {
    const body = await ctx.req.json();
    
    const schema = z.object({
      project_id: z.number().min(1)
    });

    const result = schema.safeParse(body);
    
    try {
      if (result.success) {

        const { project_id } = result.data;

        const response = await prisma.$transaction(async (tx) => {

          if (!await CON.PROJECT_EXIST(tx, project_id)) {
            throw ApiError.badRequest("project_id");
          }

          if (!await CON.IS_PROJECT_OWNER(tx, project_id, ctx.get("uid"))) {
            throw ApiError.forbidden("can't delete this project");
          }

          return await tx.project.delete({
            where: { id: project_id }
          });

        });

        return ctx.json({
          response: response === null ? 0 : 1
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

export { deleteProject };