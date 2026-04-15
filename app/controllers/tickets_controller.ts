import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'

export default class TicketsController {
  async index({ inertia }: HttpContext) {
    const tickets = await Ticket.query()
      .preload('status')
      .preload('technicians', (q) => q.select('id', 'full_name', 'email'))
      .orderBy('id', 'desc')

    return inertia.render('dashboard', {
      tickets: tickets.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status ? { slug: t.status.slug, name: t.status.name, color: t.status.color } : null,
        technicians: t.technicians.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          initials: u.initials,
        })),
      })),
    })
  }
}
