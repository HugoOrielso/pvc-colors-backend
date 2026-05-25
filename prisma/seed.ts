import bcrypt from "bcrypt";
import { prisma } from "../src/database/db";
import { UserRole } from "../src/generated/prisma/enums";

async function main() {
  const hashedPassword = await bcrypt.hash("12345678", 10);

  const users = [
    {
      name: "Administrador",
      email: "admin@pvccolors.com",
      role: "ADMIN" as UserRole,
    },
    {
      name: "Gerente General",
      email: "gerente@pvccolors.com",
      role: "GERENT" as UserRole,
    },
    {
      name: "Operador",
      email: "operador@pvccolors.com",
      role: "OPERATOR" as UserRole,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role as UserRole,
        isActive: true,
      },
    });
  }

  console.log("Seed ejecutado correctamente");
}

main()
  .catch((e) => {
    console.error("Error ejecutando seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });