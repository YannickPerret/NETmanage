import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('mail_service_accounts', (table) => {
      table.increments('id').notNullable()
      table.string('provider', 32).notNullable().defaultTo('m365')
      table.string('email', 254).notNullable().unique()
      table.string('display_name').nullable()
      table.string('microsoft_tenant_id', 128).notNullable()
      table.string('microsoft_user_id', 191).notNullable().unique()
      table.text('access_token').notNullable()
      table.text('refresh_token').notNullable()
      table.text('scopes').nullable()
      table.timestamp('token_expires_at').nullable()
      table.timestamp('last_synced_at').nullable()
      table.text('last_error').nullable()
      table.string('webhook_client_state', 128).notNullable()
      table
        .integer('connected_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('mail_service_folders', (table) => {
      table.increments('id').notNullable()
      table
        .integer('mail_service_account_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('mail_service_accounts')
        .onDelete('CASCADE')
      table.string('graph_folder_id', 191).notNullable()
      table.string('display_name').notNullable()
      table.string('parent_graph_folder_id', 191).nullable()
      table.string('well_known_name', 64).nullable()
      table.boolean('is_enabled').notNullable().defaultTo(false)
      table.text('delta_link').nullable()
      table.string('subscription_id', 191).nullable().unique()
      table.timestamp('subscription_expires_at').nullable()
      table.timestamp('last_synced_at').nullable()
      table.text('last_error').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['mail_service_account_id', 'graph_folder_id'])
      table.index(['mail_service_account_id'])
      table.index(['is_enabled'])
    })

    this.schema.createTable('mail_service_messages', (table) => {
      table.increments('id').notNullable()
      table
        .integer('mail_service_account_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('mail_service_accounts')
        .onDelete('CASCADE')
      table
        .integer('mail_service_folder_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('mail_service_folders')
        .onDelete('SET NULL')
      table
        .integer('ticket_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tickets')
        .onDelete('CASCADE')
      table.string('graph_message_id', 191).notNullable()
      table.string('internet_message_id', 512).nullable()
      table.string('conversation_id', 191).nullable()
      table.string('sender_email', 254).nullable()
      table.string('subject', 512).nullable()
      table.timestamp('received_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['mail_service_account_id', 'graph_message_id'])
      table.index(['mail_service_account_id'])
      table.index(['ticket_id'])
    })
  }

  async down() {
    this.schema.dropTable('mail_service_messages')
    this.schema.dropTable('mail_service_folders')
    this.schema.dropTable('mail_service_accounts')
  }
}
