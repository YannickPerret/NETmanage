import { CompanySchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Branch from '#models/branch'

export default class Company extends CompanySchema {
  @hasMany(() => Branch)
  declare branches: HasMany<typeof Branch>
}
