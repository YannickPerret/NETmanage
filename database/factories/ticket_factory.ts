import Ticket from '#models/ticket'
import factory from '@adonisjs/lucid/factories'

export const TicketFactory = factory
  .define(Ticket, async ({ faker }) => ({
    title: faker.hacker.phrase(),
    description: faker.lorem.paragraphs(2),
    issuerType: 'user' as const,
    issuerId: 1,
  }))
  .state('fromCompany', (ticket) => {
    ticket.issuerType = 'company'
  })
  .build()
