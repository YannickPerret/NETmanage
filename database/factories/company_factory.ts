import Company from '#models/company'
import factory from '@adonisjs/lucid/factories'
import { BranchFactory } from '#database/factories/branch_factory'

export const CompanyFactory = factory
  .define(Company, async ({ faker }) => ({
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
  }))
  .relation('branches', () => BranchFactory)
  .build()
