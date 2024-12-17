import type { Context, Next } from "hono";
import { createFactory } from "hono/factory";
import { ApiError } from "../../error/ApiError";
import prisma from "../../prisma";
import { z } from "zod";

import * as CON from "../../scripts/defaultCondition";

const factory = createFactory();

const editMembers = factory.createHandlers(
  async (ctx: Context, next: Next) => {
    const body = await ctx.req.json();
    
    const schema = z.object({
      project_id: z.number().min(1),
      user_id: z.number().min(1),      
      role_id: z.number().min(0)
    });

    const result = schema.safeParse(body);
    
    try {
      if (result.success) {

        const { project_id, user_id, role_id } = result.data;

        const response = await prisma.$transaction(async (tx) => {

          if (!await CON.PROJECT_EXIST(tx, project_id)) {
            throw ApiError.badRequest("project_id");
          }

          if (!await CON.IS_PROJECT_OWNER(tx, project_id, ctx.get("uid"))) {
            throw ApiError.forbidden("can't edit members rights in this project");
          }

          switch (role_id) {
            case 0:
              if (!await CON.USER_EXIST(tx, user_id)) {
                throw ApiError.badRequest("user_id");
              }

              if (await CON.IS_PROJECT_MEMBER(tx, project_id, user_id)) {
                return await tx.projectMember.delete({
                  where: {
                    project_id_user_id: { project_id, user_id },
                    project: {
                      owner_id: {
                        not: user_id
                      }
                    }
                  }
                });
              } else {
                throw ApiError.badRequest();
              }

            default:
              if (!await CON.ROLE_EXIST(tx, role_id)) {
                throw ApiError.badRequest("role_id");
              }

              if (!await CON.USER_EXIST(tx, user_id)) {
                throw ApiError.badRequest("user_id");
              }

              if (await CON.IS_PROJECT_MEMBER(tx, project_id, user_id)) {
                return await tx.projectMember.update({
                  where: {
                    project_id_user_id: { project_id, user_id }
                  },
                  data: { role_id }
                });
              } else {
                return await tx.projectMember.create({
                  data: { project_id, user_id, role_id }
                });
              }
          }
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

export { editMembers };