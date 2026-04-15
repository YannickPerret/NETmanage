import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('announcements', (table) => {
      table.increments('id').notNullable()
      table.string('title', 191).notNullable()
      table.text('body').notNullable()
      table.string('variant', 32).notNullable().defaultTo('info')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.integer('position').notNullable().defaultTo(0)
      table.timestamp('starts_at').nullable()
      table.timestamp('ends_at').nullable()
      table
        .integer('created_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['is_active'])
      table.index(['position'])
    })
  }

  async down() {
    this.schema.dropTable('announcements')
  }
}
