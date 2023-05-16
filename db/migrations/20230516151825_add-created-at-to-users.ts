import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.timestamp('created_at')
      .defaultTo(knex.fn.now())
      .notNullable()
      .after('email')
      .notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('created_at')
  })
}
