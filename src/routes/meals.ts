/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

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
        user_id: sessionId,
      })

      return reply.status(201).send({ message: 'Successfully created meal!' })
    },
  )

  app.get('/', { preHandler: checkSessionIdExists }, async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const meals = await knex('meals').where('user_id', sessionId).select()

    return meals
  })

  app.get('/:id', { preHandler: checkSessionIdExists }, async (request) => {
    const sessionId = request.cookies.sessionId

    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealsParamsSchema.parse(request.params)

    const meal = await knex('meals').where({ id, user_id: sessionId }).first()

    return { meal }
  })

  app.patch(
    '/:id',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const getMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        is_on_diet: z.enum(['yes', 'no']),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const { name, description, is_on_diet } = getMealSchema.parse(
        request.body,
      )

      await knex('meals')
        .where({ id, user_id: sessionId })
        .update({ name, description, is_on_diet })

      return reply.status(202).send({ message: 'Successfully edited meal!' })
    },
  )

  app.delete(
    '/:id',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      await knex('meals').where({ id, user_id: sessionId }).del()

      return reply.status(202).send({ message: 'Successfully deleted meal!' })
    },
  )

  app.get('/resume', { preHandler: checkSessionIdExists }, async (request) => {
    const { sessionId } = request.cookies

    const totalOfMeals = await knex('meals')
      .where('user_id', sessionId)
      .count('id', { as: 'total' })

    const totalOnDiet = await knex('meals')
      .where({
        user_id: sessionId,
        is_on_diet: 'yes',
      })
      .count('is_on_diet', { as: 'total' })

    const totalOutDiet = await knex('meals')
      .where({
        user_id: sessionId,
        is_on_diet: 'no',
      })
      .count('is_on_diet', { as: 'total' })

    const allMeals = await knex('meals')
      .where('user_id', sessionId)
      .orderBy('created_at', 'desc')
      .select()

    const isOnDiet = allMeals.map((meal) => meal.is_on_diet)

    const minSequence = 1
    let count = 0
    let bestSequence = 0

    for (let i = 0; i < isOnDiet.length; i++) {
      if (isOnDiet[i] === 'yes') {
        count++
      }

      if (isOnDiet[i] === 'no') {
        if (count >= minSequence && count > bestSequence) {
          bestSequence = count
        }
        count = 0
      }

      if (count >= minSequence && count > bestSequence) {
        bestSequence = count
      }
    }

    return { totalOfMeals, totalOnDiet, totalOutDiet, allMeals, bestSequence }
  })
}
