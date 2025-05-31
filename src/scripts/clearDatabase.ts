import { prisma } from "../lib/prisma";

export async function clearDatabase() {
  // Remove todas as respostas de segurança dos usuários
  await prisma.userSecurityAnswer.deleteMany({});
  // Remove todos os usuários
  await prisma.user.deleteMany({});
  // Não remove as questões de segurança!
  console.log("Banco de dados limpo (questões de segurança mantidas).");
}

if (require.main === module) {
  clearDatabase().then(() => process.exit(0));
}
