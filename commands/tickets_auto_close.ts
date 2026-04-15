import { BaseCommand } from '@adonisjs/core/ace'
import Ticket from '#models/ticket'
import User from '#models/user'
import { autoCloseTicket, RESOLVED_SLUG } from '#services/ticket_closure'
import { DateTime } from 'luxon'

export default class TicketsAutoClose extends BaseCommand {
  static commandName = 'tickets:auto-close'
  static description = 'Automatically closes resolved tickets after 2 days and sends satisfaction emails'
  static options = {
    startApp: true,
  }

  async run() {
    const threshold = DateTime.utc().minus({ days: 2 })
    const tickets = await Ticket.query()
      .whereNull('closedAt')
      .whereNotNull('resolvedAt')
      .where('resolvedAt', '<=', threshold.toSQL())
      .whereHas('status', (query) => query.where('slug', RESOLVED_SLUG))
      .preload('status')

    if (tickets.length === 0) {
      this.logger.info('No tickets due for auto-close')
      return
    }

    for (const ticket of tickets) {
      const client = ticket.issuerType === 'user' ? await User.find(ticket.issuerId) : null
      await autoCloseTicket(ticket, client)
      this.logger.info(`Ticket #${ticket.id} auto-closed`)
    }
  }
}
