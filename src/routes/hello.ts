import { z } from "zod";
import { FastifyTypedInstance } from "../types";

export function hello(app: FastifyTypedInstance) {
  app.get(
    "/",
    {
      schema: {
        description: "Hello World endpoint",
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      return reply.send({
        message: "Hello World",
      });
    }
  );
}
