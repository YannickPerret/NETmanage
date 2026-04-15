import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('type', ['client', 'technician']).notNullable().defaultTo('client')
      table
        .integer('branch_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('branches')
        .onDelete('SET NULL')
      table.index(['type'])
      table.index(['branch_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('type')
      table.dropColumn('branch_id')
    })
  }
}
