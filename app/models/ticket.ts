import { TicketSchema } from '#database/schema'
import { belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Status from '#models/status'
import Priority from '#models/priority'
import Category from '#models/category'
import Group from '#models/group'
import User from '#models/user'
import Company from '#models/company'
import Attachment from '#models/attachment'
import TicketSatisfaction from '#models/ticket_satisfaction'
import TicketEvent from '#models/ticket_event'
import { DateTime } from 'luxon'

export type IssuerType = 'company' | 'user'

export default class Ticket extends TicketSchema {
  @column()
  declare parentTicketId: number | null

  @column.dateTime()
  declare resolvedAt: DateTime | null

  @column.dateTime()
  declare closedAt: DateTime | null

  @column()
  declare closeConfirmationToken: string | null

  @column.dateTime()
  declare closeConfirmationSentAt: DateTime | null

  @column()
  declare satisfactionToken: string | null

  @column.dateTime()
  declare satisfactionRequestedAt: DateTime | null

  @column.dateTime()
  declare satisfactionSubmittedAt: DateTime | null

  @belongsTo(() => Status)
  declare status: BelongsTo<typeof Status>

  @belongsTo(() => Priority)
  declare priority: BelongsTo<typeof Priority>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @belongsTo(() => User, { foreignKey: 'createdByUserId' })
  declare creator: BelongsTo<typeof User>

  @belongsTo(() => Ticket, { foreignKey: 'parentTicketId' })
  declare parentTicket: BelongsTo<typeof Ticket>

  @manyToMany(() => Group, {
    pivotTable: 'group_ticket',
  })
  declare groups: ManyToMany<typeof Group>

  @manyToMany(() => User, {
    pivotTable: 'ticket_user',
    pivotTimestamps: { createdAt: 'assigned_at', updatedAt: false },
  })
  declare technicians: ManyToMany<typeof User>

  @hasMany(() => TicketSatisfaction)
  declare satisfactions: HasMany<typeof TicketSatisfaction>

  @hasMany(() => Ticket, { foreignKey: 'parentTicketId' })
  declare childTickets: HasMany<typeof Ticket>

  @hasMany(() => TicketEvent)
  declare events: HasMany<typeof TicketEvent>

  /**
   * Resolve the polymorphic issuer (company or user).
   */
  async loadIssuer(): Promise<Company | User | null> {
    if (this.issuerType === 'company') {
      return Company.find(this.issuerId)
    }
    if (this.issuerType === 'user') {
      return User.find(this.issuerId)
    }
    return null
  }

  /**
   * Query attachments attached to this ticket.
   */
  attachments() {
    return Attachment.query().where('attachable_type', 'ticket').where('attachable_id', this.id)
  }
}
