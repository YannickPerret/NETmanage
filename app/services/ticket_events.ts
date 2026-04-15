import Ticket from '#models/ticket'
import TicketEvent from '#models/ticket_event'
import User from '#models/user'

export type SerializedTicketEvent = {
  id: number
  type: string
  description: string
  createdAt: string
  actor: {
    id: number | null
    fullName: string | null
    email: string | null
    initials: string | null
  } | null
}

export async function createTicketEvent(
  ticket: Ticket,
  options: {
    type: string
    description: string
    actorUserId?: number | null
    metadata?: Record<string, unknown> | null
  }
) {
  return TicketEvent.create({
    ticketId: ticket.id,
    actorUserId: options.actorUserId ?? null,
    eventType: options.type,
    description: options.description,
    metadata: options.metadata ?? null,
  })
}

export function serializeTicketEvent(event: TicketEvent): SerializedTicketEvent {
  return {
    id: event.id,
    type: event.eventType,
    description: event.description,
    createdAt: event.createdAt.toISO() ?? event.createdAt.toSQL() ?? '',
    actor: event.actor
      ? {
          id: event.actor.id,
          fullName: event.actor.fullName,
          email: event.actor.email,
          initials: event.actor.initials,
        }
      : null,
  }
}

export async function loadSerializedTicketEvents(ticket: Ticket) {
  const events = await TicketEvent.query()
    .where('ticketId', ticket.id)
    .preload('actor', (query) => query.select('id', 'full_name', 'email'))
    .orderBy('created_at', 'desc')

  return events.map(serializeTicketEvent)
}

export async function logTicketCreated(ticket: Ticket, actor: User) {
  await createTicketEvent(ticket, {
    type: 'created',
    actorUserId: actor.id,
    description: `Ticket created by ${actor.fullName ?? actor.email}.`,
  })
}

export async function logTicketOpened(ticket: Ticket, actor: User) {
  await createTicketEvent(ticket, {
    type: 'opened',
    actorUserId: actor.id,
    description: `${actor.fullName ?? actor.email} took ownership of the ticket.`,
  })
}

export async function logTicketResolved(ticket: Ticket, actor: User) {
  await createTicketEvent(ticket, {
    type: 'resolved',
    actorUserId: actor.id,
    description: `${actor.fullName ?? actor.email} marked the ticket as resolved.`,
  })
}

export async function logTicketClosed(ticket: Ticket, actor: User | null, mode: 'client' | 'auto') {
  await createTicketEvent(ticket, {
    type: mode === 'client' ? 'closed_by_client' : 'closed_automatically',
    actorUserId: actor?.id ?? null,
    description:
      mode === 'client'
        ? `${actor?.fullName ?? actor?.email ?? 'The client'} confirmed the closure.`
        : 'Ticket closed automatically after the confirmation window expired.',
  })
}

export async function logTicketSatisfaction(ticket: Ticket, actor: User, rating: number) {
  await createTicketEvent(ticket, {
    type: 'satisfaction_submitted',
    actorUserId: actor.id,
    description: `${actor.fullName ?? actor.email} submitted a satisfaction rating of ${rating}/5.`,
    metadata: { rating },
  })
}

export async function logTicketParentUpdated(
  ticket: Ticket,
  actor: User,
  parentTicket: Ticket | null,
  previousParentTicket: Ticket | null
) {
  const description = parentTicket
    ? previousParentTicket
      ? `${actor.fullName ?? actor.email} changed the parent ticket from #${previousParentTicket.id} to #${parentTicket.id}.`
      : `${actor.fullName ?? actor.email} linked this ticket to parent #${parentTicket.id}.`
    : `${actor.fullName ?? actor.email} removed the parent ticket link.`

  await createTicketEvent(ticket, {
    type: 'parent_updated',
    actorUserId: actor.id,
    description,
    metadata: {
      parentTicketId: parentTicket?.id ?? null,
      previousParentTicketId: previousParentTicket?.id ?? null,
    },
  })
}
