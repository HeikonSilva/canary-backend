import { z } from 'zod'
import { FastifyTypedInstance } from '../../types'
import { prisma } from '../../lib/prisma'
import { hashPassword, hashSecurityAnswer } from '../../utils/hash'
import validatePassword from '../../utils/password'

export default function userIndex(app: FastifyTypedInstance) {
  app.post(
    '/users',
    {
      schema: {
        description: 'Create a new user',
        body: z.object({
          name: z.string(),
          displayName: z.string().optional(),
          password: z.string(),
          securityAnswers: z
            .array(
              z.object({
                questionId: z.number().gt(0),
                answer: z.string(),
              })
            )
            .length(3),
        }),
        response: {
          201: z.object({
            id: z.string(),
            name: z.string(),
            displayName: z.string().optional(),
          }),
          400: z.object({
            UserAlreadyExists: z.boolean().optional(),
            invalidSecurityQuestions: z.boolean().optional(),
            duplicatedSecurityQuestions: z.boolean().optional(),
            passwordMissingUppercase: z.boolean().optional(),
            passwordMissingSpecialCharacter: z.boolean().optional(),
            passwordMissingNumber: z.boolean().optional(),
            passwordMisssingLowercase: z.boolean().optional(),
            passwordTooShort: z.boolean().optional(),
          }),
        },
      },
    },
    async (req, res) => {
      // Define the request body structure
      const { name, displayName, password, securityAnswers } = req.body

      // create errors object to collect validation errors
      const errors: Record<string, any> = {}

      // Validate security answers
      const questionIds = securityAnswers.map((a) => a.questionId)
      const questions = await prisma.securityQuestion.findMany({
        where: { id: { in: questionIds } },
      })
      const validQuestionIds = new Set(questions.map((q) => q.id))
      const invalidQuestionIds = questionIds.filter(
        (id) => !validQuestionIds.has(id)
      )
      if (invalidQuestionIds.length > 0) {
        errors.invalidSecurityQuestions = true
      }

      // Validate repeated security questions
      const uniqueQuestionIds = new Set(questionIds)
      if (uniqueQuestionIds.size !== questionIds.length) {
        errors.duplicatedSecurityQuestions = true
      }

      // Check if the user already exists
      const existUser = await prisma.user.findUnique({
        where: { name },
      })
      if (existUser) {
        errors.UserAlreadyExists = true
      }

      // Validate password strength
      const passwordErrors = validatePassword(password)

      // If there are validation errors, return them
      if (Object.keys(errors).length > 0) {
        return res.status(400).send(errors)
      }

      const hashedPassword = await hashPassword(password)
      const displayNameValue = displayName || name
      const hashedSecurityAnswers = await Promise.all(
        securityAnswers.map(async (sa) => ({
          questionId: sa.questionId,
          answerHash: await hashSecurityAnswer(sa.answer),
        }))
      )

      // Create the user in the database
      const user = await prisma.user.create({
        data: {
          name,
          displayName: displayNameValue,
          passwordHash: hashedPassword,
          securityAnswers: {
            create: hashedSecurityAnswers.map((sa) => ({
              questionId: sa.questionId,
              answerHash: sa.answerHash,
            })),
          },
        },
      })

      // Return the created user
      return res.status(201).send({
        id: user.idPublic,
        name: user.name,
        displayName: user.displayName,
      })
    }
  )
}
