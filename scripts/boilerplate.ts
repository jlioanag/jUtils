import { PrismaClient } from "../src/generated/prisma";
import * as readline from "node:readline";

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const _title = await new Promise<string>((resolve) => {
    rl.question("Enter title: ", (answer) => {
      resolve(answer);
    });
  });

  const _roleId = await new Promise<string>((resolve) => {
    rl.question("Enter role ID: ", (answer) => {
      resolve(answer);
    });
  });

  rl.close();

  if (!_title || !_roleId) {
    console.error("Title and Role ID are required.");
    return;
  }

  const gameRole = await prisma.gameRole.create({
    data: {
      title: _title,
      roleId: _roleId,
    },
  });

  console.log(`Added GameRole: ${gameRole}`);

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
