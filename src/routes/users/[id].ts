import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { FastifyTypedInstance } from '../../types'
import { hashPassword, verifySecurityAnswer } from '../../utils/hash'
import validatePassword from '../../utils/password'

export default function userId(app: FastifyTypedInstance) {
  app.addHook('onRequest', async (req, res) => {
    try {
      await req.jwtVerify()
    } catch (err) {
      return res.status(401).send({ err })
    }
  })

  // Update user by id
  app.put(
    '/users',
    {
      schema: {
        description: 'Update user by ID',
        security: [{ bearerAuth: [] }],
        body: z.object({
          name: z.string().optional(),
          displayName: z.string().optional(),
          password: z.string().optional(),
          securityAnswers: z
            .array(
              z.object({
                questionId: z.number().gt(0),
                answer: z.string(),
              })
            )
            .length(3)
            .optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            userId: z.number(),
          }),
          401: z.object({
            userNotFound: z.boolean().optional(),
            passwordMissingUppercase: z.boolean().optional(),
            passwordMissingSpecialCharacter: z.boolean().optional(),
            passwordMissingNumber: z.boolean().optional(),
            passwordMisssingLowercase: z.boolean().optional(),
            passwordTooShort: z.boolean().optional(),
            invalidSecurityQuestions: z.boolean().optional(),
          }),
          500: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      try {
        const userId = req.user.userId
        if (!userId) {
          return res.status(401).send({ userNotFound: true })
        }

        const { name, displayName, password, securityAnswers } = req.body

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
          return res.status(401).send({ userNotFound: true })
        }

        // Password validation if provided
        if (password) {
          const passwordErrors = validatePassword(password)

          // Require security answers when changing password
          if (!securityAnswers || securityAnswers.length !== 3) {
            return res.status(401).send({ invalidSecurityQuestions: true })
          }

          // Validate security questions exist
          const securityQuestions = await prisma.securityQuestion.findMany({
            where: { id: { in: securityAnswers.map((a) => a.questionId) } },
          })

          if (securityQuestions.length !== 3) {
            return res.status(401).send({ invalidSecurityQuestions: true })
          }

          // Verify security answers
          const userAnswers = await prisma.userSecurityAnswer.findMany({
            where: {
              userId,
              questionId: { in: securityAnswers.map((a) => a.questionId) },
            },
          })

          for (const providedAnswer of securityAnswers) {
            const userAnswer = userAnswers.find(
              (ua) => ua.questionId === providedAnswer.questionId
            )
            if (
              !userAnswer ||
              !(await verifySecurityAnswer(
                providedAnswer.answer,
                userAnswer.answerHash
              ))
            ) {
              return res.status(401).send({ invalidSecurityQuestions: true })
            }
          }

          if (Object.keys(passwordErrors).length > 0) {
            return res.status(401).send(passwordErrors)
          }
        }

        // Update user
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(name !== undefined && { name }),
            ...(displayName !== undefined && { displayName }),
            ...(password && { passwordHash: await hashPassword(password) }),
          },
        })

        return res.status(200).send({
          message: 'User updated successfully',
          userId: updatedUser.id,
        })
      } catch (error) {
        console.error('Error updating user:', error)
        return res.status(500).send({ error: 'Internal server error' })
      }
    }
  )
}
