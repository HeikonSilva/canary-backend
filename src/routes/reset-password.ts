import { FastifyTypedInstance } from "../types";
import { prisma } from "../lib/prisma";
import { hashPassword, verifySecurityAnswer } from "../utils/hash";
import { z } from "zod";

export async function resetPassword(app: FastifyTypedInstance) {
  app.post(
    "/reset-password",
    {
      schema: {
        description: "Resetar senha usando nome e perguntas de segurança",
        body: z.object({
          name: z.string(),
          securityAnswers: z
            .array(
              z.object({
                questionId: z.number(),
                answer: z.string().min(1, "Resposta obrigatória"),
              })
            )
            .length(3, {
              message:
                "Todas as perguntas de segurança são obrigatórias e devem ser exatamente 3",
            }),
          newPassword: z.string().min(8, "Senha muito curta"),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, securityAnswers, newPassword } = request.body;

      const user = await prisma.user.findUnique({
        where: { name },
        include: { securityAnswers: true },
      });

      if (!user) {
        return reply.status(400).send({ message: "Usuário não encontrado" });
      }

      for (const ans of securityAnswers) {
        const userAnswer = user.securityAnswers.find(
          (a) => a.questionId === ans.questionId
        );
        if (!userAnswer) {
          return reply.status(400).send({ message: "Pergunta inválida" });
        }
        const isCorrect = await verifySecurityAnswer(
          ans.answer,
          userAnswer.answerHash
        );
        if (!isCorrect) {
          return reply.status(400).send({ message: "Respostas incorretas" });
        }
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });

      return reply
        .status(200)
        .send({ message: "Senha redefinida com sucesso" });
    }
  );
}
