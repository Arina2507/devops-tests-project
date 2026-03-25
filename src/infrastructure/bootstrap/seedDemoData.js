const prisma = require("../database/prismaClient");

async function seedUsers() {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    return;
  }

  await prisma.user.createMany({
    data: [
      { name: "Arina Novak", email: "arina@example.com" },
      { name: "Marek Dvorak", email: "marek@example.com" },
      { name: "Eva Svobodova", email: "eva@example.com" }
    ]
  });
}

async function seedResources() {
  const resourceCount = await prisma.resource.count();

  if (resourceCount > 0) {
    return;
  }

  await prisma.resource.createMany({
    data: [
      {
        name: "Room A",
        type: "Meeting Room",
        openHour: 9,
        closeHour: 18,
        capacity: 6
      },
      {
        name: "Room B",
        type: "Meeting Room",
        openHour: 8,
        closeHour: 17,
        capacity: 10
      },
      {
        name: "Court 1",
        type: "Sport Court",
        openHour: 10,
        closeHour: 21,
        capacity: 4
      }
    ]
  });
}

async function main() {
  await seedUsers();
  await seedResources();
  console.log("Demo data is ready");
}

main()
  .catch((error) => {
    console.error("Failed to seed demo data", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });