// src/database/seed.ts

import bcrypt from "bcrypt";
import { prisma } from "./db";
import { UserRole } from "../generated/prisma/enums";

export async function runSeed() {
  const password = "Pvccolors@2026"; 
  const users = [
    {
      name: "Administrador",
      email: "admin@pvccolors.com",
      password,
      role: "ADMIN" as UserRole,
    },
    {
      name: "Gerente General",
      email: "gerente@pvccolors.com",
      password,
      role: "GERENT" as UserRole,
    },
    {
      name: "Operador",
      email: "operador@pvccolors.com",
      password,
      role: "OPERATOR" as UserRole,
    },
  ];

  for (const user of users) {
    const exists = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (exists) continue;

    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role as UserRole,
        isActive: true,
      },
    });
  }

  console.log("Seed ejecutado correctamente 🚀");
}