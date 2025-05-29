import { FastifyInstance } from "fastify";
import { createUser } from "./routes/create-user";
import { loginUser } from "./routes/login";
import { profile } from "./routes/profile";
import { hello } from "./routes/hello";

export async function routes(app: FastifyInstance) {
  app.register(hello);

  app.register(createUser);
  app.register(loginUser);
  app.register(profile);
}
