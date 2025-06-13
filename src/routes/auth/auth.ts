import { z } from 'zod'
import { FastifyTypedInstance } from '../../types'
import { prisma } from '../../lib/prisma'
import { verifyPassword } from '../../utils/hash'

export default function login(app: FastifyTypedInstance) {
  app.post(
    '/auth',
    {
      schema: {
        description: 'User login',
        body: z.object({
          name: z.string(),
          password: z.string(),
        }),
        response: {
          200: z.object({
            token: z.string(),
            refreshToken: z.string(),
            userId: z.number(),
          }),
          401: z.object({
            passwordInvalid: z.boolean().optional(),
            userNotFound: z.boolean().optional(),
          }),
        },
      },
    },
    async (req, res) => {
      const { name, password } = req.body

      const errors: Record<string, any> = {}

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { name },
      })

      if (!user) {
        errors.userNotFound = true
        return res.status(401).send(errors)
      }

      const isPasswordValid = await verifyPassword(password, user.passwordHash)
      if (!isPasswordValid) {
        errors.passwordInvalid = true
      }

      if (Object.keys(errors).length > 0) {
        return res.status(401).send(errors)
      }

      const token = app.jwt.sign({ userId: user.id }, { expiresIn: '1h' })
      const refreshToken = app.jwt.sign(
        { userId: user.id },
        { expiresIn: '7d' }
      )
      return res.status(200).send({
        token,
        refreshToken,
        userId: user.id,
      })
    }
  )
}
