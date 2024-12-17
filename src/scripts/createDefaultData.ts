import prisma from "../prisma";

export async function createDefaultRoles() {
  const rolesExist = await prisma.role.count();

  if (rolesExist === 0) {
    await prisma.role.createMany({
      data: [
        { name: 'viewer' },
        { name: 'member' },
        { name: 'owner' }
      ]
    });

    console.log("Default roles added");
  }
}

export async function createDefaultUsers() {
  const userExist = await prisma.user.count();

  if(userExist === 0) {
    await prisma.user.createMany({
      data: [
        { id: 1 },
        { id: 100 },
        { id: 333 }
      ]
    });
  }
}