import { AttachmentSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Ticket from '#models/ticket'

export type AttachableType = 'ticket'

export default class Attachment extends AttachmentSchema {
  @belongsTo(() => User, { foreignKey: 'uploadedByUserId' })
  declare uploadedBy: BelongsTo<typeof User>

  /**
   * Resolve the polymorphic owner.
   */
  async loadOwner(): Promise<Ticket | null> {
    if (this.attachableType === 'ticket') {
      return Ticket.find(this.attachableId)
    }
    return null
  }
}
