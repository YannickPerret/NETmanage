import User from '#models/user'
import factory from '@adonisjs/lucid/factories'

export const UserFactory = factory
  .define(User, async ({ faker }) => ({
    fullName: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: 'password',
    type: 'client' as const,
  }))
  .state('technician', (user) => {
    user.type = 'technician'
    user.branchId = null
    user.role = 'technician'
  })
  .state('manager', (user) => {
    user.type = 'technician'
    user.branchId = null
    user.role = 'manager'
  })
  .state('facturation', (user) => {
    user.type = 'technician'
    user.branchId = null
    user.role = 'facturation'
  })
  .state('superAdmin', (user) => {
    user.type = 'technician'
    user.branchId = null
    user.role = 'super-admin'
  })
  .state('client', (user) => {
    user.type = 'client'
    user.role = null
  })
  .build()
