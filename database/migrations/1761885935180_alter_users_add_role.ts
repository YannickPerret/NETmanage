import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Only set for technicians; null for clients.
      table
        .enum('role', ['technician', 'manager', 'facturation', 'super-admin'])
        .nullable()
      table.index(['role'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
  }
}
