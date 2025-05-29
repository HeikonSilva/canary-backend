import { FastifyTypedInstance } from "../types";
import { prisma } from "../lib/prisma";
import { hashPassword, hashSecurityAnswer } from "../utils/hash";
import { z } from "zod";

export async function createUser(app: FastifyTypedInstance) {
  app.post(
    "/create-user",
    {
      schema: {
        description: "Create a new user",
        body: z.object({
          name: z.string(),
          password: z.string().min(8, "Senha muito curta"),
          displayName: z.string().optional(),
          securityAnswers: z
            .array(
              z.object({
                questionId: z.number(),
                answer: z.string().min(1, "Resposta obrigatória"),
              })
            )
            .min(3, "Todas as pergunta de segurança são obrigatória"),
        }),
      },
    },
    async (request, reply) => {
      const { name, password, displayName, securityAnswers } = request.body;

      const existingUser = await prisma.user.findFirst({
        where: { name },
      });

      if (existingUser) {
        return reply.status(400).send({
          message: "Usuário já existe com esse email ou nome",
        });
      }

      const questionIds = securityAnswers.map((a) => a.questionId);
      const questions = await prisma.securityQuestion.findMany({
        where: { id: { in: questionIds } },
        select: { id: true },
      });
      if (questions.length !== securityAnswers.length) {
        return reply
          .status(400)
          .send({ message: "Pergunta de segurança inválida" });
      }

      const hashedPassword = await hashPassword(password);

      const user = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            name,
            displayName: displayName ?? name,
            passwordHash: hashedPassword,
          },
          select: {
            id: true,
            name: true,
            displayName: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        await Promise.all(
          securityAnswers.map(async (ans) => {
            const answerHash = await hashSecurityAnswer(ans.answer);
            await tx.userSecurityAnswer.create({
              data: {
                userId: createdUser.id,
                questionId: ans.questionId,
                answerHash,
              },
            });
          })
        );

        return createdUser;
      });

      return reply.status(201).send(user);
    }
  );
}
