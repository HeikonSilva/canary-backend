import { FastifyTypedInstance } from "../types";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { verifyPassword } from "../utils/hash";

export function loginUser(app: FastifyTypedInstance) {
  app.post(
    "/login",
    {
      schema: {
        description: "Login",
        body: z.object({
          name: z.string().min(1, "Nome é obrigatório"),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { name, password } = request.body;

      const user = await prisma.user.findUnique({
        where: { name },
      });

      if (!user) {
        return reply.status(400).send({
          message: "Usuário não encontrado",
        });
      }

      const isPasswordValid = await verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        return reply.status(400).send({
          message: "Senha incorreta",
        });
      }

      const token = app.jwt.sign(
        { id: user.id },
        {
          expiresIn: "1h",
        }
      );

      return reply.status(200).send({ token });
    }
  );
}
