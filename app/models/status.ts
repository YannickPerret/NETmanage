import { StatusSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Ticket from '#models/ticket'

export default class Status extends StatusSchema {
  @hasMany(() => Ticket)
  declare tickets: HasMany<typeof Ticket>
}
