import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import MailServiceAccount from '#models/mail_service_account'
import MailServiceFolder from '#models/mail_service_folder'
import Ticket from '#models/ticket'

export default class MailServiceMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare mailServiceAccountId: number

  @column()
  declare mailServiceFolderId: number | null

  @column()
  declare ticketId: number

  @column()
  declare graphMessageId: string

  @column()
  declare internetMessageId: string | null

  @column()
  declare conversationId: string | null

  @column()
  declare senderEmail: string | null

  @column()
  declare subject: string | null

  @column.dateTime()
  declare receivedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => MailServiceAccount)
  declare account: BelongsTo<typeof MailServiceAccount>

  @belongsTo(() => MailServiceFolder)
  declare folder: BelongsTo<typeof MailServiceFolder>

  @belongsTo(() => Ticket)
  declare ticket: BelongsTo<typeof Ticket>
}
