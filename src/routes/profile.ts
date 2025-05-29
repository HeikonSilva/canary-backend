import { FastifyTypedInstance } from "../types";

export async function profile(app: FastifyTypedInstance) {
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ err });
    }
  });

  app.get(
    "/profile",
    {
      schema: {
        description: "Get user profile",
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      return request.user;
    }
  );
}
