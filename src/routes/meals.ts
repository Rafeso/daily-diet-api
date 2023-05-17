/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const meals = await knex('meals').select()

    return meals
  })

  app.get('/:id', async (request) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealsParamsSchema.parse(request.params)

    const meal = await knex('meals').where('id', id).first()

    return { meal }
  })

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      is_on_diet: z.enum(['yes', 'no']),
    })

    const { name, description, is_on_diet } = createMealBodySchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_on_diet,
    })

    return reply.status(201).send({ message: 'Successfully created meal!' })
  })
}
