import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attachments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      // Polymorphic owner, e.g. 'ticket'
      table.string('attachable_type', 32).notNullable()
      table.integer('attachable_id').unsigned().notNullable()

      table.string('filename').notNullable()
      table.string('path').notNullable()
      table.integer('size').unsigned().notNullable()
      table.string('mime_type', 128).nullable()
      table
        .integer('uploaded_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['attachable_type', 'attachable_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
