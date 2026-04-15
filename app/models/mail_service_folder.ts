import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import MailServiceAccount from '#models/mail_service_account'
import MailServiceMessage from '#models/mail_service_message'

export default class MailServiceFolder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare mailServiceAccountId: number

  @column()
  declare graphFolderId: string

  @column()
  declare displayName: string

  @column()
  declare parentGraphFolderId: string | null

  @column()
  declare wellKnownName: string | null

  @column()
  declare isEnabled: boolean

  @column({ serializeAs: null })
  declare deltaLink: string | null

  @column({ serializeAs: null })
  declare subscriptionId: string | null

  @column.dateTime()
  declare subscriptionExpiresAt: DateTime | null

  @column.dateTime()
  declare lastSyncedAt: DateTime | null

  @column()
  declare lastError: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => MailServiceAccount)
  declare account: BelongsTo<typeof MailServiceAccount>

  @hasMany(() => MailServiceMessage)
  declare messages: HasMany<typeof MailServiceMessage>
}
