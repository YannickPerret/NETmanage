import { BranchSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Company from '#models/company'
import User from '#models/user'

export default class Branch extends BranchSchema {
  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @hasMany(() => User, { foreignKey: 'branchId' })
  declare clients: HasMany<typeof User>
}
