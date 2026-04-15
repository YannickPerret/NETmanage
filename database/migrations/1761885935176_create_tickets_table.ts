import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tickets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title').notNullable()
      table.text('description').notNullable()

      table
        .integer('status_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('statuses')
        .onDelete('RESTRICT')
      table
        .integer('priority_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('priorities')
        .onDelete('RESTRICT')
      table
        .integer('category_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('categories')
        .onDelete('RESTRICT')

      // Polymorphic issuer: 'company' | 'user'
      table.string('issuer_type', 32).notNullable()
      table.integer('issuer_id').unsigned().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status_id'])
      table.index(['priority_id'])
      table.index(['category_id'])
      table.index(['issuer_type', 'issuer_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
