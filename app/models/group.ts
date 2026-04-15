import { GroupSchema } from '#database/schema'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Ticket from '#models/ticket'

export default class Group extends GroupSchema {
  @manyToMany(() => Ticket, {
    pivotTable: 'group_ticket',
  })
  declare tickets: ManyToMany<typeof Ticket>
}
