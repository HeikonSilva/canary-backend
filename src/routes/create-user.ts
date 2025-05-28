import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { hashPassword } from "../utils/hash";

export default async function createUser(app: FastifyInstance) {
  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8, "Senha muito curta"),
  });

  app.post("/user", async (request, reply) => {
    const { name, password, email } = createUserSchema.parse(request.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.status(400).send({
        message: "Usuário já existe com esse email",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username: name,
        email,
        password: hashedPassword,
      },
    });

    return reply.status(201).send(user);
  });
}
