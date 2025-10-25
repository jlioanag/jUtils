import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const gameRoles = await prisma.gameRole.findMany();
  console.log(gameRoles);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
