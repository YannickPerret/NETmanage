import { PrioritySchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Ticket from '#models/ticket'

export default class Priority extends PrioritySchema {
  @hasMany(() => Ticket)
  declare tickets: HasMany<typeof Ticket>
}
