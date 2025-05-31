import { z } from 'zod'
import { FastifyTypedInstance } from '../types'
import { prisma } from '../lib/prisma'

export default function securityAwnser(app: FastifyTypedInstance) {
  app.get(
    '/security-awnser',
    {
      schema: {
        response: {
          200: z.object({
            securityQuestions: z.array(
              z.object({
                id: z.number(),
                question: z.string(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const securityQuestions = await prisma.securityQuestion.findMany({
        select: {
          id: true,
          question: true,
        },
      })
      return reply.send({
        securityQuestions,
      })
    }
  )
}
