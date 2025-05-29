import { compare, hash } from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash);
}

export async function hashSecurityAnswer(answer: string): Promise<string> {
  return hash(answer, 12);
}

export async function verifySecurityAnswer(
  answer: string,
  hash: string
): Promise<boolean> {
  return compare(answer, hash);
}
