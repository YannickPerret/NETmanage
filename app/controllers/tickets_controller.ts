import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Ticket from '#models/ticket'
import TicketSatisfaction from '#models/ticket_satisfaction'
import Status from '#models/status'
import Priority from '#models/priority'
import Category from '#models/category'
import Group from '#models/group'
import User from '#models/user'
import Company from '#models/company'
import { createTicketValidator } from '#validators/ticket'
import {
  closeTicketAfterClientConfirmation,
  markTicketResolved,
  submitTicketSatisfaction,
} from '#services/ticket_closure'
import {
  sendTicketAssignedNotifications,
  sendTicketCreatedConfirmation,
  sendTicketOpenedNotification,
} from '#services/ticket_mailer'
import {
  AWAITING_SLUG,
  CLOSED_SLUG,
  IN_PROGRESS_SLUG,
  RESOLVED_SLUG,
  broadcastTicketState,
  loadRealtimeTicket,
  serializeTicket,
} from '#services/ticket_realtime'
import {
  loadSerializedTicketEvents,
  logTicketCreated,
  logTicketOpened,
  logTicketParentUpdated,
} from '#services/ticket_events'
import { getActiveAnnouncementsForDashboard } from '#controllers/announcements_controller'
import {
  submitTicketSatisfactionValidator,
  updateTicketParentValidator,
} from '#validators/ticket'

export default class TicketsController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const [awaiting, mine, options, announcements] = await Promise.all([
      this.getAwaitingTicketsForDashboard(user),
      this.getDashboardTickets(user),
      this.getFormOptions(),
      getActiveAnnouncementsForDashboard(),
    ])

    return inertia.render('dashboard', {
      awaitingTickets: awaiting.map(serializeTicket),
      myTickets: mine.map(serializeTicket),
      options,
      announcements,
    })
  }

  async list({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const [tickets, options] = await Promise.all([
      this.getTicketsIndexTickets(user),
      this.getFormOptions(),
    ])

    return inertia.render('tickets', {
      tickets: tickets.map(serializeTicket),
      options,
    })
  }

  async show({ inertia, auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const ticket = await this.findScopedTicketForUser(user, Number(params.id))

    if (!ticket) {
      session.flash('error', 'Ticket not found.')
      return response.redirect().toRoute('tickets.index')
    }

    const events = await loadSerializedTicketEvents(ticket)
    const issuer = await ticket.loadIssuer()

    return inertia.render('tickets/show', {
      ticket: {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        createdAt: ticket.createdAt.toISO() ?? ticket.createdAt.toSQL() ?? '',
        status: ticket.status
          ? {
              slug: ticket.status.slug,
              name: ticket.status.name,
              color: ticket.status.color,
            }
          : null,
        priority: ticket.priority
          ? {
              id: ticket.priority.id,
              name: ticket.priority.name,
              color: ticket.priority.color,
            }
          : null,
        category: ticket.category
          ? {
              id: ticket.category.id,
              name: ticket.category.name,
              slug: ticket.category.slug,
            }
          : null,
        createdBy: {
          id: ticket.creator?.id ?? null,
          fullName: ticket.creator?.fullName ?? null,
          email: ticket.creator?.email ?? null,
        },
        issuer: issuer
          ? {
              type: ticket.issuerType,
              id: issuer.id,
              label: 'fullName' in issuer ? (issuer.fullName ?? issuer.email) : issuer.name,
              email: 'email' in issuer ? issuer.email : null,
            }
          : null,
        technicians: ticket.technicians.map((technician) => ({
          id: technician.id,
          fullName: technician.fullName,
          initials: technician.initials,
        })),
        groups: ticket.groups.map((group) => ({
          id: group.id,
          name: group.name,
          slug: group.slug,
        })),
        parentTicket: ticket.parentTicket ? serializeTicket(ticket.parentTicket) : null,
        childTickets: ticket.childTickets.map(serializeTicket),
        events,
        canManageRelations: user.isTechnician,
      },
    })
  }

  async satisfactions({ inertia, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!user.isTechnician) {
      session.flash('error', 'Only technicians can access satisfactions.')
      return response.redirect().toRoute('dashboard')
    }

    const satisfactions = await TicketSatisfaction.query()
      .where('technicianId', user.id)
      .preload('ticket', (query) => query.select('id', 'title'))
      .preload('submittedBy', (query) => query.select('id', 'full_name', 'email'))
      .orderBy('created_at', 'desc')

    const averageRating =
      satisfactions.length === 0
        ? null
        : Number(
            (
              satisfactions.reduce((total, satisfaction) => total + satisfaction.rating, 0) /
              satisfactions.length
            ).toFixed(1)
          )

    return inertia.render('satisfactions', {
      averageRating,
      satisfactions: satisfactions.map((satisfaction) => ({
        id: satisfaction.id,
        rating: satisfaction.rating,
        comment: satisfaction.comment,
        createdAt: satisfaction.createdAt.toISO() ?? satisfaction.createdAt.toSQL() ?? '',
        ticket: {
          id: satisfaction.ticket.id,
          title: satisfaction.ticket.title,
        },
        submittedBy: {
          id: satisfaction.submittedBy.id,
          fullName: satisfaction.submittedBy.fullName,
          email: satisfaction.submittedBy.email,
        },
      })),
    })
  }

  async store({ request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createTicketValidator)
    const groupIds = [...new Set(payload.groupIds ?? [])]
    const technicianIds = [...new Set(payload.technicianIds ?? [])]

    // Status is derived from whether technicians are assigned at creation.
    const targetSlug = technicianIds.length ? IN_PROGRESS_SLUG : AWAITING_SLUG
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

    if (groupIds.length) {
      await ticket.related('groups').sync(groupIds)
    }
    if (technicianIds.length) {
      await ticket.related('technicians').sync(technicianIds)
    }

    await logTicketCreated(ticket, user)

    const realtimeTicket = await loadRealtimeTicket(ticket)
    broadcastTicketState(ticket, realtimeTicket)
    await sendTicketCreatedConfirmation(ticket, user)

    if (technicianIds.length) {
      const technicians = await User.query().whereIn('id', technicianIds)
      await sendTicketAssignedNotifications(ticket, technicians)
    }

    session.flash('success', `Ticket #${ticket.id} created`)
    return response.redirect().toRoute('dashboard')
  }

  async open({ params, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!user.isTechnician) {
      session.flash('error', 'Only technicians can open tickets.')
      return response.redirect().toRoute('dashboard')
    }

    const inProgress = await Status.findByOrFail('slug', IN_PROGRESS_SLUG)
    const trx = await db.transaction()

    try {
      const ticket = await Ticket.query({ client: trx })
        .where('id', params.id)
        .forUpdate()
        .preload('status')
        .firstOrFail()

      if (ticket.status?.slug !== AWAITING_SLUG) {
        session.flash('error', 'This ticket is not awaiting assignment.')
        await trx.rollback()
        return response.redirect().toRoute('dashboard')
      }

      ticket.useTransaction(trx)
      ticket.statusId = inProgress.id
      await ticket.save()

      // Claim the ticket inside the same transaction to avoid double opening races.
      await ticket.related('technicians').attach([user.id], trx)
      await trx.commit()

      const realtimeTicket = await loadRealtimeTicket(ticket)
      broadcastTicketState(ticket, realtimeTicket)
      await logTicketOpened(ticket, user)

      if (ticket.issuerType === 'user') {
        const client = await User.find(ticket.issuerId)
        if (client) {
          await sendTicketOpenedNotification(ticket, client, user)
        }
      }

      session.flash('success', `Ticket #${ticket.id} opened`)
      return response.redirect().toRoute('dashboard')
    } catch (error) {
      if (!trx.isCompleted) {
        await trx.rollback()
      }

      throw error
    }
  }

  async resolve({ params, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!user.isTechnician) {
      session.flash('error', 'Only technicians can resolve tickets.')
      return response.redirect().toRoute('tickets.index')
    }

    const ticket = await Ticket.query()
      .where('id', params.id)
      .whereHas('technicians', (query) => query.where('users.id', user.id))
      .preload('status')
      .firstOrFail()

    if (!ticket.status || ![IN_PROGRESS_SLUG, 'pending'].includes(ticket.status.slug)) {
      session.flash('error', 'This ticket cannot be resolved right now.')
      return response.redirect().toRoute('tickets.index')
    }

    const client = ticket.issuerType === 'user' ? await User.find(ticket.issuerId) : null
    await markTicketResolved(ticket, client, user)

    session.flash('success', `Ticket #${ticket.id} marked as resolved`)
    return response.redirect().toRoute('tickets.index')
  }

  async setParent({ params, auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!user.isTechnician) {
      session.flash('error', 'Only technicians can manage ticket links.')
      return response.redirect().toRoute('tickets.index')
    }

    const payload = await request.validateUsing(updateTicketParentValidator)
    const ticket = await Ticket.query()
      .where('id', params.id)
      .preload('parentTicket')
      .firstOrFail()
    const parentTicket = await Ticket.query()
      .where('id', payload.parentTicketId)
      .preload('status')
      .preload('creator', (query) => query.select('id', 'full_name', 'email'))
      .preload('technicians', (query) => query.select('id', 'full_name', 'email'))
      .firstOrFail()

    if (ticket.id === parentTicket.id) {
      session.flash('error', 'A ticket cannot be its own parent.')
      return response.redirect().toPath(`/tickets/${ticket.id}`)
    }

    if (await this.wouldCreateParentCycle(ticket.id, parentTicket.id)) {
      session.flash('error', 'This parent link would create a cycle.')
      return response.redirect().toPath(`/tickets/${ticket.id}`)
    }

    const previousParent = ticket.parentTicket ?? null
    ticket.parentTicketId = parentTicket.id
    await ticket.save()
    await logTicketParentUpdated(ticket, user, parentTicket, previousParent)

    const realtimeTicket = await loadRealtimeTicket(ticket)
    broadcastTicketState(ticket, realtimeTicket)

    session.flash('success', `Ticket #${ticket.id} linked to parent #${parentTicket.id}`)
    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async removeParent({ params, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!user.isTechnician) {
      session.flash('error', 'Only technicians can manage ticket links.')
      return response.redirect().toRoute('tickets.index')
    }

    const ticket = await Ticket.query()
      .where('id', params.id)
      .preload('parentTicket')
      .firstOrFail()

    if (!ticket.parentTicketId) {
      return response.redirect().toPath(`/tickets/${ticket.id}`)
    }

    const previousParent = ticket.parentTicket ?? null
    ticket.parentTicketId = null
    await ticket.save()
    await logTicketParentUpdated(ticket, user, null, previousParent)

    const realtimeTicket = await loadRealtimeTicket(ticket)
    broadcastTicketState(ticket, realtimeTicket)

    session.flash('success', `Parent link removed from ticket #${ticket.id}`)
    return response.redirect().toPath(`/tickets/${ticket.id}`)
  }

  async confirmClosePage({ params, request, inertia }: HttpContext) {
    const ticket = await this.findTicketForCloseConfirmation(params.id, request.input('token'))

    return inertia.render('ticket_close_confirmation', {
      ticketId: Number(params.id),
      title: ticket?.title ?? null,
      valid: !!ticket,
      confirmed: false,
    })
  }

  async confirmClose({ params, request, inertia }: HttpContext) {
    const ticket = await this.findTicketForCloseConfirmation(params.id, request.input('token'))

    if (!ticket) {
      return inertia.render('ticket_close_confirmation', {
        ticketId: Number(params.id),
        title: null,
        valid: false,
        confirmed: false,
      })
    }

    const client = ticket.issuerType === 'user' ? await User.find(ticket.issuerId) : null
    await closeTicketAfterClientConfirmation(ticket, client, client)

    return inertia.render('ticket_close_confirmation', {
      ticketId: ticket.id,
      title: ticket.title,
      valid: true,
      confirmed: true,
    })
  }

  async satisfactionPage({ params, request, inertia }: HttpContext) {
    const ticket = await this.findTicketForSatisfaction(params.id, request.input('token'))

    return inertia.render('ticket_satisfaction', {
      ticketId: Number(params.id),
      title: ticket?.title ?? null,
      token: request.input('token') ?? null,
      valid: !!ticket,
      submitted: false,
    })
  }

  async submitSatisfaction({ params, request, inertia }: HttpContext) {
    const token = request.input('token')
    const ticket = await this.findTicketForSatisfaction(params.id, token)

    if (!ticket) {
      return inertia.render('ticket_satisfaction', {
        ticketId: Number(params.id),
        title: null,
        token,
        valid: false,
        submitted: false,
      })
    }

    const payload = await request.validateUsing(submitTicketSatisfactionValidator)
    const client = ticket.issuerType === 'user' ? await User.find(ticket.issuerId) : null

    if (!client) {
      return inertia.render('ticket_satisfaction', {
        ticketId: ticket.id,
        title: ticket.title,
        token,
        valid: false,
        submitted: false,
      })
    }

    await submitTicketSatisfaction(ticket, client, payload)

    return inertia.render('ticket_satisfaction', {
      ticketId: ticket.id,
      title: ticket.title,
      token: null,
      valid: true,
      submitted: true,
    })
  }

  private ticketQuery() {
    return Ticket.query()
      .preload('status')
      .preload('priority')
      .preload('category')
      .preload('groups', (query) => query.select('id', 'name', 'slug'))
      .preload('creator', (query) =>
        query
          .select('id', 'full_name', 'email', 'branch_id')
          .preload('branch', (branchQuery) => branchQuery.preload('company'))
      )
      .preload('technicians', (query) => query.select('id', 'full_name', 'email'))
      .orderBy('id', 'desc')
  }

  private async findScopedTicketForUser(user: User, ticketId: number) {
    const query = Ticket.query()
      .where('id', ticketId)
      .preload('status')
      .preload('priority')
      .preload('category')
      .preload('groups', (groupQuery) => groupQuery.select('id', 'name', 'slug'))
      .preload('creator', (query) => query.select('id', 'full_name', 'email'))
      .preload('technicians', (query) => query.select('id', 'full_name', 'email'))
      .preload('parentTicket', (query) => {
        query
          .preload('status')
          .preload('creator', (creatorQuery) => creatorQuery.select('id', 'full_name', 'email'))
          .preload('technicians', (technicianQuery) =>
            technicianQuery.select('id', 'full_name', 'email')
          )
      })
      .preload('childTickets', (query) => {
        query
          .orderBy('id', 'desc')
          .preload('status')
          .preload('creator', (creatorQuery) => creatorQuery.select('id', 'full_name', 'email'))
          .preload('technicians', (technicianQuery) =>
            technicianQuery.select('id', 'full_name', 'email')
          )
      })

    if (!user.isTechnician) {
      query.where('issuerType', 'user').where('issuerId', user.id)
    }

    return query.first()
  }

  private getTicketsIndexTickets(user: User) {
    if (user.isTechnician) {
      return this.ticketQuery()
    }

    return this.ticketQuery().where('issuerType', 'user').where('issuerId', user.id)
  }

  private getDashboardTickets(user: User) {
    if (user.isTechnician) {
      return this.ticketQuery()
        .whereHas('technicians', (query) => query.where('users.id', user.id))
        .whereHas('status', (query) => query.whereNotIn('slug', [RESOLVED_SLUG, CLOSED_SLUG]))
    }

    return this.getTicketsIndexTickets(user)
  }

  private getAwaitingTicketsForDashboard(user: User) {
    if (!user.isTechnician) {
      return Promise.resolve([])
    }

    return this.ticketQuery().whereHas('status', (query) => query.where('slug', AWAITING_SLUG))
  }

  private async getFormOptions() {
    const [priorities, categories, groups, technicians, statuses, companies] = await Promise.all([
      Priority.query().orderBy('level', 'asc'),
      Category.query().orderBy('name', 'asc'),
      Group.query().orderBy('name', 'asc'),
      User.query().where('type', 'technician').select('id', 'full_name', 'email').orderBy('full_name', 'asc'),
      Status.query().orderBy('position', 'asc'),
      Company.query().orderBy('name', 'asc'),
    ])

    return {
      priorities: priorities.map((priority) => ({
        id: priority.id,
        name: priority.name,
        slug: priority.slug,
        level: priority.level,
        color: priority.color,
      })),
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })),
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
        slug: group.slug,
      })),
      technicians: technicians.map((technician) => ({
        id: technician.id,
        fullName: technician.fullName,
      })),
      statuses: statuses.map((status) => ({
        id: status.id,
        name: status.name,
        slug: status.slug,
        color: status.color,
      })),
      companies: companies.map((company) => ({
        id: company.id,
        name: company.name,
      })),
    }
  }

  private async findTicketForCloseConfirmation(ticketId: number, token?: string | null) {
    if (!token) {
      return null
    }

    return Ticket.query()
      .where('id', ticketId)
      .where('closeConfirmationToken', token)
      .whereHas('status', (query) => query.where('slug', RESOLVED_SLUG))
      .preload('status')
      .first()
  }

  private async findTicketForSatisfaction(ticketId: number, token?: string | null) {
    if (!token) {
      return null
    }

    return Ticket.query()
      .where('id', ticketId)
      .where('satisfactionToken', token)
      .whereHas('status', (query) => query.where('slug', CLOSED_SLUG))
      .preload('status')
      .first()
  }

  private async wouldCreateParentCycle(ticketId: number, candidateParentId: number) {
    let currentTicket = await Ticket.find(candidateParentId)

    while (currentTicket) {
      if (currentTicket.id === ticketId) {
        return true
      }

      if (!currentTicket.parentTicketId) {
        return false
      }

      currentTicket = await Ticket.find(currentTicket.parentTicketId)
    }

    return false
  }
}
