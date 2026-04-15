import Branch from '#models/branch'
import factory from '@adonisjs/lucid/factories'
import { CompanyFactory } from '#database/factories/company_factory'
import { UserFactory } from '#database/factories/user_factory'

export const BranchFactory = factory
  .define(Branch, async ({ faker }) => ({
    name: `${faker.location.city()} Branch`,
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    country: faker.location.country(),
  }))
  .relation('company', () => CompanyFactory)
  .relation('clients', () => UserFactory)
  .build()
