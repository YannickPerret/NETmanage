import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tickets'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('resolved_at').nullable()
      table.timestamp('closed_at').nullable()
      table.string('close_confirmation_token', 128).nullable().unique()
      table.timestamp('close_confirmation_sent_at').nullable()
      table.string('satisfaction_token', 128).nullable().unique()
      table.timestamp('satisfaction_requested_at').nullable()
      table.timestamp('satisfaction_submitted_at').nullable()

      table.index(['resolved_at'])
      table.index(['closed_at'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['resolved_at'])
      table.dropIndex(['closed_at'])
      table.dropUnique(['close_confirmation_token'])
      table.dropUnique(['satisfaction_token'])
      table.dropColumns(
        'resolved_at',
        'closed_at',
        'close_confirmation_token',
        'close_confirmation_sent_at',
        'satisfaction_token',
        'satisfaction_requested_at',
        'satisfaction_submitted_at'
      )
    })
  }
}
