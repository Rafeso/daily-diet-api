// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id?: string
      name: string
      email: string
    }
    meals: {
      id: string
      user_id: string
      name: string
      description: string
      is_on_diet: boolean
      created_at: string
    }
  }
}
