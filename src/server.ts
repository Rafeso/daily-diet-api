import fastify from 'fastify'
import { env } from './env'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'

const app = fastify()

app.register(mealsRoutes, { prefix: '/meals' })
app.register(usersRoutes, { prefix: '/users' })

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
