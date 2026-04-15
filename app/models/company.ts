import { CompanySchema } from '#database/schema'
import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Branch from '#models/branch'

export default class Company extends CompanySchema {
  @column()
  declare code: string | null

  @hasMany(() => Branch)
  declare branches: HasMany<typeof Branch>
}
