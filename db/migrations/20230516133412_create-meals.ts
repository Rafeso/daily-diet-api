import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (t) => {
    t.uuid('id').primary()
    t.string('user_id')
    t.string('name').notNullable()
    t.text('description').notNullable()
    t.enu('is_on_diet', ['yes', 'no']).defaultTo('no')
    t.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
