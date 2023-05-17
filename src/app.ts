import fastifyCookie from '@fastify/cookie'
import fastify from 'fastify'
import { mealsRoutes } from './routes/meals'
import { usersRoutes } from './routes/users'

export const app = fastify()

app.register(fastifyCookie)

app.register(mealsRoutes, { prefix: '/meals' })

app.register(usersRoutes, { prefix: '/users' })
