import { prisma } from "../lib/prisma";

export async function validateSecurityQuestions(app: unknown) {
  const securityQuestions = [
    { id: 1, question: "Qual o nome do seu primeiro animal de estimação?" },
    { id: 2, question: "Qual era o seu apelido de infância?" },
    { id: 3, question: "Em que cidade seus pais se conheceram?" },
    { id: 4, question: "Qual a sua comida favorita?" },
    { id: 5, question: "Qual o nome do seu melhor amigo de infância?" },
  ];

  for (const q of securityQuestions) {
    await prisma.securityQuestion.upsert({
      where: { id: q.id },
      update: { question: q.question },
      create: q,
    });
  }

  await prisma.securityQuestion.deleteMany({
    where: {
      id: { notIn: securityQuestions.map((q) => q.id) },
    },
  });

  console.log("Security questions verified and updated if necessary.");
}
