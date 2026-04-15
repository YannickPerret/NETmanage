import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'
import MailServiceFolder from '#models/mail_service_folder'
import MailServiceMessage from '#models/mail_service_message'

export default class MailServiceAccount extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare provider: 'm365'

  @column()
  declare email: string

  @column()
  declare displayName: string | null

  @column()
  declare microsoftTenantId: string

  @column()
  declare microsoftUserId: string

  @column({ serializeAs: null })
  declare accessToken: string

  @column({ serializeAs: null })
  declare refreshToken: string

  @column()
  declare scopes: string | null

  @column.dateTime()
  declare tokenExpiresAt: DateTime | null

  @column.dateTime()
  declare lastSyncedAt: DateTime | null

  @column()
  declare lastError: string | null

  @column({ serializeAs: null })
  declare webhookClientState: string

  @column()
  declare connectedByUserId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'connectedByUserId' })
  declare connectedBy: BelongsTo<typeof User>

  @hasMany(() => MailServiceFolder)
  declare folders: HasMany<typeof MailServiceFolder>

  @hasMany(() => MailServiceMessage)
  declare messages: HasMany<typeof MailServiceMessage>
}
