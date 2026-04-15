import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('tickets', (table) => {
      table
        .integer('parent_ticket_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('tickets')
        .onDelete('SET NULL')
      table.index(['parent_ticket_id'])
    })

    this.schema.createTable('ticket_events', (table) => {
      table.increments('id').notNullable()
      table
        .integer('ticket_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tickets')
        .onDelete('CASCADE')
      table
        .integer('actor_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('event_type', 64).notNullable()
      table.text('description').notNullable()
      table.jsonb('metadata').nullable()
      table.timestamp('created_at').notNullable()

      table.index(['ticket_id'])
      table.index(['event_type'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable('ticket_events')

    this.schema.alterTable('tickets', (table) => {
      table.dropIndex(['parent_ticket_id'])
      table.dropColumn('parent_ticket_id')
    })
  }
}
