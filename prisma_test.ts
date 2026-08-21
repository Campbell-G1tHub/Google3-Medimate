import { prisma } from "./lib/prisma";

async function main() {
  const user = await prisma.testTable.create({
    data: {
      name: "ALI G",
    }
  })

  console.log(user)

  const allUsers = await prisma.testTable.findMany();
  console.log("All users:", JSON.stringify(allUsers, null, 2));
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