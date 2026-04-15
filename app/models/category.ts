import { CategorySchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Ticket from '#models/ticket'

export default class Category extends CategorySchema {
  @hasMany(() => Ticket)
  declare tickets: HasMany<typeof Ticket>
}
