import type { PrismaClient, Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

type Client = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export const ROLE_EXIST = async (tx: Client, role_id: number) => {
  const userExist = await tx.role.findUnique({
    where: { id: role_id }
  });

  return !(userExist === null);
}

export const USER_EXIST = async (tx: Client, user_id: number) => {
  const userExist = await tx.user.findUnique({
    where: { id: user_id }
  });

  return !(userExist === null);
}

export const PROJECT_EXIST = async (tx: Client, project_id: number) => {
  const projectExist = await tx.project.findUnique({
    where: { id: project_id }
  });

  return !(projectExist === null);
}

export const IS_PROJECT_OWNER = async (tx: Client, project_id: number, user_id: number) => {
  const project = await tx.project.findUnique({
    where: { id: project_id },
    select: {
      id: true,
      owner_id: true
    }
  });

  return project === null ? false : project.owner_id === user_id;
}

export const IS_PROJECT_MEMBER = async (tx: Client, project_id: number, user_id: number) => {
  const memberExist = await tx.projectMember.findUnique({
    where: {
      project_id_user_id: {
        project_id,
        user_id
      }
    }
  });

  return !(memberExist === null);
}