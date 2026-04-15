import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Branch from '#models/branch'
import Ticket from '#models/ticket'

export type TechnicianRole = 'technician' | 'manager' | 'facturation' | 'super-admin'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @hasMany(() => Ticket, { foreignKey: 'createdByUserId' })
  declare createdTickets: HasMany<typeof Ticket>

  @manyToMany(() => Ticket, {
    pivotTable: 'ticket_user',
    pivotTimestamps: { createdAt: 'assigned_at', updatedAt: false },
  })
  declare assignedTickets: ManyToMany<typeof Ticket>

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }

  get isClient() {
    return this.type === 'client'
  }

  get isTechnician() {
    return this.type === 'technician'
  }

  get isSuperAdmin() {
    return this.role === 'super-admin'
  }

  get isManager() {
    return this.role === 'manager'
  }

  hasRole(role: TechnicianRole) {
    return this.role === role
  }
}
