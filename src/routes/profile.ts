import { z } from "zod";
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
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            displayName: z.string().optional(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user as {
        id: string;
        name: string;
        displayName?: string;
        createdAt: Date | string;
        updatedAt: Date | string;
      };

      return reply.send({
        id: user.id,
        name: user.name,
        displayName: user.displayName,
        createdAt:
          user.createdAt instanceof Date
            ? user.createdAt.toISOString()
            : user.createdAt,
        updatedAt:
          user.updatedAt instanceof Date
            ? user.updatedAt.toISOString()
            : user.updatedAt,
      });
    }
  );
}
