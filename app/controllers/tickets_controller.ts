import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'
import Status from '#models/status'
import Priority from '#models/priority'
import Category from '#models/category'
import Group from '#models/group'
import User from '#models/user'
import { createTicketValidator } from '#validators/ticket'

const AWAITING_SLUG = 'awaiting_open'
const IN_PROGRESS_SLUG = 'in_progress'

function serializeTicket(t: Ticket) {
  return {
    id: t.id,
    title: t.title,
    status: t.status
      ? { slug: t.status.slug, name: t.status.name, color: t.status.color }
      : null,
    technicians: t.technicians.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      initials: u.initials,
    })),
  }
}

export default class TicketsController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const [awaiting, mine, priorities, categories, groups, technicians] = await Promise.all([
      Ticket.query()
        .whereHas('status', (q) => q.where('slug', AWAITING_SLUG))
        .preload('status')
        .preload('technicians', (q) => q.select('id', 'full_name', 'email'))
        .orderBy('id', 'desc'),
      Ticket.query()
        .whereHas('technicians', (q) => q.where('users.id', user.id))
        .preload('status')
        .preload('technicians', (q) => q.select('id', 'full_name', 'email'))
        .orderBy('id', 'desc'),
      Priority.query().orderBy('level', 'asc'),
      Category.query().orderBy('name', 'asc'),
      Group.query().orderBy('name', 'asc'),
      User.query()
        .where('type', 'technician')
        .select('id', 'full_name', 'email')
        .orderBy('full_name', 'asc'),
    ])

    return inertia.render('dashboard', {
      awaitingTickets: awaiting.map(serializeTicket),
      myTickets: mine.map(serializeTicket),
      options: {
        priorities: priorities.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          level: p.level,
          color: p.color,
        })),
        categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
        groups: groups.map((g) => ({ id: g.id, name: g.name, slug: g.slug })),
        technicians: technicians.map((u) => ({ id: u.id, fullName: u.fullName })),
      },
    })
  }

  async store({ request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createTicketValidator)

    // Status is derived from whether technicians are assigned at creation.
    const targetSlug = payload.technicianIds?.length ? IN_PROGRESS_SLUG : AWAITING_SLUG
    const status = await Status.findByOrFail('slug', targetSlug)

    const ticket = await Ticket.create({
      title: payload.title,
      description: payload.description,
      statusId: status.id,
      priorityId: payload.priorityId,
      categoryId: payload.categoryId,
      issuerType: 'user',
      issuerId: user.id,
      createdByUserId: user.id,
    })

    if (payload.groupIds?.length) {
      await ticket.related('groups').sync(payload.groupIds)
    }
    if (payload.technicianIds?.length) {
      await ticket.related('technicians').sync(payload.technicianIds)
    }

    session.flash('success', `Ticket #${ticket.id} created`)
    return response.redirect().toRoute('dashboard')
  }

  async open({ params, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const ticket = await Ticket.findOrFail(params.id)
    await ticket.load('status')

    if (ticket.status?.slug !== AWAITING_SLUG) {
      session.flash('error', 'This ticket is not awaiting assignment.')
      return response.redirect().toRoute('dashboard')
    }

    const inProgress = await Status.findByOrFail('slug', IN_PROGRESS_SLUG)
    ticket.statusId = inProgress.id
    await ticket.save()

    // Attach current user as technician (no-op if already assigned)
    await ticket.related('technicians').attach([user.id])

    session.flash('success', `Ticket #${ticket.id} opened`)
    return response.redirect().toRoute('dashboard')
  }
}
