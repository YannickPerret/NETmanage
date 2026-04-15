import { TicketSchema } from '#database/schema'
import { belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Status from '#models/status'
import Priority from '#models/priority'
import Category from '#models/category'
import Group from '#models/group'
import User from '#models/user'
import Company from '#models/company'
import Attachment from '#models/attachment'

export type IssuerType = 'company' | 'user'

export default class Ticket extends TicketSchema {
  @belongsTo(() => Status)
  declare status: BelongsTo<typeof Status>

  @belongsTo(() => Priority)
  declare priority: BelongsTo<typeof Priority>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @belongsTo(() => User, { foreignKey: 'createdByUserId' })
  declare creator: BelongsTo<typeof User>

  @manyToMany(() => Group, {
    pivotTable: 'group_ticket',
  })
  declare groups: ManyToMany<typeof Group>

  @manyToMany(() => User, {
    pivotTable: 'ticket_user',
    pivotTimestamps: { createdAt: 'assigned_at', updatedAt: false },
  })
  declare technicians: ManyToMany<typeof User>

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
