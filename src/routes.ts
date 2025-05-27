import { FastifyInstance } from "fastify";
import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

export async function routes(app: FastifyInstance) {
  app.get("/", () => {
    return "Hello World";
  });

  app.get("/users", async () => {
    const users = await prisma.user.findMany();
    return users;
  });
}
