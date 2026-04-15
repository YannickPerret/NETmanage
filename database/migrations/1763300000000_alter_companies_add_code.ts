import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('companies', (table) => {
      table.string('code', 64).nullable()
      table.index(['code'])
    })
  }

  async down() {
    this.schema.alterTable('companies', (table) => {
      table.dropIndex(['code'])
      table.dropColumn('code')
    })
  }
}
