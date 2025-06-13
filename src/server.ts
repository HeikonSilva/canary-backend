import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { fastifyJwt } from '@fastify/jwt'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod'

import { routes } from './routes'
import { validateSecurityQuestions } from './scripts/validateSecurityQuestions'

import 'dotenv/config'

const backHost = process.env.BACK_HOST ? process.env.BACK_HOST : 'localhost'
const backPort = process.env.BACK_PORT
  ? parseInt(process.env.BACK_PORT, 10)
  : 3000
const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not set.')
}

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: `http://${process.env.FRONT_HOST || 'localhost'}:${
    process.env.FRONT_PORT || 5173
  }`,
})

app.register(fastifyJwt, {
  secret: jwtSecret,
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Canary API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(routes)

async function environmentCheck() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set.')
    console.error('For testing purposes, default value is: "file:./dev.db".')
    process.exit(1)
  }
  if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is not set.')
    process.exit(1)
  }
  if (!process.env.BACK_HOST) {
    console.error(
      'WARNING: BACK_HOST environment variable is not set. Using default "localhost".'
    )
  }
  if (!process.env.BACK_PORT) {
    console.error(
      'WARNING: BACK_PORT environment variable is not set. Using default 3000.'
    )
  }
  if (!process.env.FRONT_HOST) {
    console.error(
      'WARNING: FRONT_HOST environment variable is not set. Using default "localhost".'
    )
  }
  if (!process.env.FRONT_PORT) {
    console.error(
      'WARNING: FRONT_PORT environment variable is not set. Using default 5173.'
    )
  }
}

async function start() {
  try {
    await validateSecurityQuestions(app)
    await environmentCheck()
    await app.listen({ port: backPort, host: backHost })
    console.log(`Server is running on http://${backHost}:${backPort}`)
  } catch (error) {
    console.error('Error during server startup:', error)
    process.exit(1)
  }
}

start()
