import type { Context, Next } from "hono";
import { createFactory } from "hono/factory";
import { ApiError } from "../../error/ApiError";
import prisma from "../../prisma";
import { z } from "zod";
import { CreateProjectSchema } from "../../schemes";

const factory = createFactory();

const create = factory.createHandlers(
  async (ctx: Context, next: Next) => {
    const body = await ctx.req.json();

    const schema = CreateProjectSchema;
    const result = schema.safeParse(body);
    
    try {
      if (result.success) {
        const prevProject = await prisma.project.findFirst({
          where: {
            OR: [
              { name: result.data.name },
              { short_name: result.data.short_name }
            ]
          }
        });

        if (prevProject !== null) {
          throw ApiError.badRequest("Project with this name or short_name has already been created");
        }

        const project = await prisma.$transaction(async (tx) => {
          const project = await tx.project.create({
            data: {
              ...result.data,
              owner_id: ctx.get("uid")
            },
            select: {
              id: true
            }
          });

          await tx.projectMember.create({
            data: {
              project_id: project.id,
              user_id: ctx.get("uid"),
              role_id: 3
            }
          });

          return project;
        });

        if (project === null) {
          throw ApiError.internal("Failed to create project, try again later");
        }

        return ctx.json({ response: project.id });

      } else {
        throw ApiError.badRequest(`[${result.error.errors[0].path}] ${result.error.errors[0].message}`)
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

export { create };