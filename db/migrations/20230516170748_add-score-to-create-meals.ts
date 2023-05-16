import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (t) => {
    t.integer('days_sequence').defaultTo(0)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (t) => {
    t.dropColumn('days_sequence')
  })
}
