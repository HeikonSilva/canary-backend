import { FastifyTypedInstance } from "../types";

export function hello(app: FastifyTypedInstance) {
  app.get("/", async () => {
    return { message: "Hello World!" };
  });
}
