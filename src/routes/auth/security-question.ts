import { z } from 'zod'
import { FastifyTypedInstance } from '../../types'
import { prisma } from '../../lib/prisma'

export function securityQuestion(app: FastifyTypedInstance) {
  app.get(
    '/security-question',
    {
      schema: {
        description: 'Get security question',
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              question: z.string(),
            })
          ),
        },
      },
    },
    async (req, res) => {
      const questions = await prisma.securityQuestion.findMany({
        select: {
          id: true,
          question: true,
        },
      })
      return res.send(
        questions.map((q) => ({
          id: q.id.toString(),
          question: q.question,
        }))
      )
    }
  )

  app.post(
    '/security-question/:id',
    {
      schema: {
        description: 'Get security question by ID',
        body: z.object({
          id: z.number(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            question: z.string(),
          }),
          404: z.object({
            idNotExist: z.boolean(),
          }),
        },
      },
    },
    async (req, res) => {
      const question = await prisma.securityQuestion.findMany({
        where: {
          id: req.body.id,
        },
        select: {
          id: true,
          question: true,
        },
      })

      if (question.length === 0) {
        return res.status(404).send({ idNotExist: true })
      } else {
        const q = question[0]
        return res.send({
          id: q.id.toString(),
          question: q.question,
        })
      }
    }
  )
}
