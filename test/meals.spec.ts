import { afterAll, beforeEach, beforeAll, describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'alohoroma', email: 'foo1@bar.com' })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Almoço',
        description: 'Arroz com carne e feijão',
        is_on_diet: 'yes',
      })
      .expect(201)
  })

  it('should be able to list all meals for a user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'alohoroma', email: 'foo1@bar.com' })

    const cookies = createUserResponse.get('Set-Cookie')

    const id = createUserResponse.body.id

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz com carne e feijão',
      is_on_diet: 'yes',
    })

    const listMealsReponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .send({ id, user_id: cookies })
      .expect(200)

    expect(listMealsReponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Almoço',
        description: 'Arroz com carne e feijão',
        is_on_diet: 'yes',
      }),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'alohoroma', email: 'foo1@bar.com' })

    const cookies = createUserResponse.get('Set-Cookie')

    const id = createUserResponse.body.id

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz com carne e feijão',
      is_on_diet: 'yes',
    })

    const listMealsReponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .send({ id, user_id: cookies })
      .expect(200)

    const mealId = listMealsReponse.body.meals[0].id

    const getMealReponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({ id, user_id: cookies })
      .expect(200)

    expect(getMealReponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Almoço',
        description: 'Arroz com carne e feijão',
        is_on_diet: 'yes',
      }),
    )
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'alohoroma', email: 'foo1@bar.com' })

    const cookies = createUserResponse.get('Set-Cookie')

    const id = createUserResponse.body.id

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz com carne e feijão',
      is_on_diet: 'yes',
    })

    const listMealsReponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .send({ id, user_id: cookies })
      .expect(200)

    const mealId = listMealsReponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(202)
  })

  it('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'alohoroma', email: 'foo1@bar.com' })

    const cookies = createUserResponse.get('Set-Cookie')

    const id = createUserResponse.body.id

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz com carne e feijão',
      is_on_diet: 'yes',
    })

    const listMealsReponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .send({ id, user_id: cookies })
      .expect(200)

    const mealId = listMealsReponse.body.meals[0].id

    await request(app.server)
      .patch(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Jantar',
        description: 'Batata frita',
        is_on_diet: 'no',
      })
      .expect(202)
  })

  it('should be able to get a meals resume', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'alohoroma', email: 'foo1@bar.com' })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz com carne e feijão',
      is_on_diet: 'yes',
    })

    const reasumeResponse = await request(app.server)
      .get('/meals/resume')
      .set('Cookie', cookies)

    expect(reasumeResponse.body).toEqual(
      expect.objectContaining({
        totalOfMeals: expect.anything(),
        totalOnDiet: expect.anything(),
        totalOutDiet: expect.anything(),
        allMeals: expect.anything(),
        bestSequence: 1,
      }),
    )
  })
})
