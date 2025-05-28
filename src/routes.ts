import { FastifyInstance } from "fastify";
import createUser from "./routes/create-user";

export async function routes(app: FastifyInstance) {
  app.register(createUser);
}
