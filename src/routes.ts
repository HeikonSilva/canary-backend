import { FastifyInstance } from 'fastify'
import { securityQuestion } from './routes/auth/security-question'
import userIndex from './routes/users'
import userId from './routes/users/[id]'
import login from './routes/auth/auth'

export async function routes(app: FastifyInstance) {
  app.register(securityQuestion)

  app.register(userIndex)
  app.register(userId)

  app.register(login)
}
