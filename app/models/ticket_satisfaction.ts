import Ticket from '#models/ticket'
import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class TicketSatisfaction extends BaseModel {
  static table = 'ticket_satisfactions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare ticketId: number

  @column()
  declare technicianId: number

  @column()
  declare submittedByUserId: number

  @column()
  declare rating: number

  @column()
  declare comment: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Ticket)
  declare ticket: BelongsTo<typeof Ticket>

  @belongsTo(() => User, { foreignKey: 'technicianId' })
  declare technician: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'submittedByUserId' })
  declare submittedBy: BelongsTo<typeof User>
}
