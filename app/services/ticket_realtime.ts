import Ticket from '#models/ticket'
import transmit from '@adonisjs/transmit/services/main'

export const AWAITING_SLUG = 'awaiting_open'
export const IN_PROGRESS_SLUG = 'in_progress'
export const RESOLVED_SLUG = 'resolved'
export const CLOSED_SLUG = 'closed'
export const AWAITING_TICKETS_CHANNEL = 'tickets/awaiting'
export const TECHNICIAN_TICKETS_INDEX_CHANNEL = 'tickets/index'
export const USER_TICKETS_INDEX_CHANNEL_PATTERN = 'users/:id/tickets/index'

export type SerializedTicket = {
  id: number
  title: string
  description: string | null
  createdAt: string
  createdBy: {
    id: number | null
    fullName: string | null
    email: string | null
  }
  status: {
    slug: string
    name: string
    color: string | null
  } | null
  priority: {
    slug: string
    name: string
    level: number
    color: string | null
  } | null
  category: {
    slug: string
    name: string
  } | null
  company: {
    id: number
    name: string
  } | null
  technicians: Array<{
    id: number
    fullName: string | null
    initials: string
  }>
}

export type TicketRealtimeEvent =
  | { type: 'awaiting:upsert'; ticket: SerializedTicket }
  | { type: 'awaiting:remove'; ticketId: number }
  | { type: 'mine:upsert'; ticket: SerializedTicket }
  | { type: 'mine:remove'; ticketId: number }
  | { type: 'tickets:upsert'; ticket: SerializedTicket }
  | { type: 'ticket:updated'; ticket: SerializedTicket }

export function technicianTicketsChannel(userId: number) {
  return `technicians/${userId}/tickets`
}

export function userTicketsChannel(userId: number) {
  return `users/${userId}/tickets/index`
}

export function ticketChannel(ticketId: number) {
  return `tickets/${ticketId}`
}

export function serializeTicket(ticket: Ticket): SerializedTicket {
  const branchCompany = ticket.creator?.branch?.company ?? null

  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description ?? null,
    createdAt: ticket.createdAt.toISO() ?? ticket.createdAt.toSQL() ?? '',
    createdBy: {
      id: ticket.creator?.id ?? null,
      fullName: ticket.creator?.fullName ?? null,
      email: ticket.creator?.email ?? null,
    },
    status: ticket.status
      ? { slug: ticket.status.slug, name: ticket.status.name, color: ticket.status.color }
      : null,
    priority: ticket.priority
      ? {
          slug: ticket.priority.slug,
          name: ticket.priority.name,
          level: ticket.priority.level,
          color: ticket.priority.color,
        }
      : null,
    category: ticket.category
      ? { slug: ticket.category.slug, name: ticket.category.name }
      : null,
    company: branchCompany
      ? { id: branchCompany.id, name: branchCompany.name }
      : null,
    technicians: ticket.technicians.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      initials: user.initials,
    })),
  }
}

export async function loadRealtimeTicket(ticket: Ticket) {
  await ticket.load('status')
  await ticket.load('priority')
  await ticket.load('category')
  await ticket.load('technicians', (query) => query.select('id', 'full_name', 'email'))
  await ticket.load('creator', (query) => {
    query.select('id', 'full_name', 'email', 'branch_id').preload('branch', (branchQuery) => {
      branchQuery.preload('company')
    })
  })

  return serializeTicket(ticket)
}

export function broadcastAwaitingTicketUpsert(ticket: SerializedTicket) {
  const payload: TicketRealtimeEvent = { type: 'awaiting:upsert', ticket }
  transmit.broadcast(AWAITING_TICKETS_CHANNEL, payload)
}

export function broadcastAwaitingTicketRemoved(ticketId: number) {
  const payload: TicketRealtimeEvent = { type: 'awaiting:remove', ticketId }
  transmit.broadcast(AWAITING_TICKETS_CHANNEL, payload)
}

export function broadcastMineUpsert(ticket: SerializedTicket, technicianIds: number[]) {
  const uniqueTechnicianIds = [...new Set(technicianIds)]
  const payload: TicketRealtimeEvent = { type: 'mine:upsert', ticket }

  uniqueTechnicianIds.forEach((technicianId) => {
    transmit.broadcast(technicianTicketsChannel(technicianId), payload)
  })
}

export function broadcastMineRemoved(ticketId: number, technicianIds: number[]) {
  const uniqueTechnicianIds = [...new Set(technicianIds)]
  const payload: TicketRealtimeEvent = { type: 'mine:remove', ticketId }

  uniqueTechnicianIds.forEach((technicianId) => {
    transmit.broadcast(technicianTicketsChannel(technicianId), payload)
  })
}

export function broadcastTicketsIndexUpsert(ticket: SerializedTicket, ownerUserId: number | null) {
  const payload: TicketRealtimeEvent = { type: 'tickets:upsert', ticket }

  transmit.broadcast(TECHNICIAN_TICKETS_INDEX_CHANNEL, payload)

  if (ownerUserId !== null) {
    transmit.broadcast(userTicketsChannel(ownerUserId), payload)
  }
}

export function broadcastTicketUpdated(ticket: SerializedTicket) {
  const payload: TicketRealtimeEvent = { type: 'ticket:updated', ticket }
  transmit.broadcast(ticketChannel(ticket.id), payload)
}

export function broadcastTicketState(ticket: Ticket, serializedTicket: SerializedTicket) {
  const ownerUserId = ticket.issuerType === 'user' ? ticket.issuerId : null
  const technicianIds = serializedTicket.technicians.map((technician) => technician.id)

  if (serializedTicket.status?.slug === AWAITING_SLUG) {
    broadcastAwaitingTicketUpsert(serializedTicket)
  } else {
    broadcastAwaitingTicketRemoved(serializedTicket.id)
  }

  if (technicianIds.length && ![RESOLVED_SLUG, CLOSED_SLUG].includes(serializedTicket.status?.slug ?? '')) {
    broadcastMineUpsert(serializedTicket, technicianIds)
  } else if (technicianIds.length) {
    broadcastMineRemoved(serializedTicket.id, technicianIds)
  }

  broadcastTicketsIndexUpsert(serializedTicket, ownerUserId)
  broadcastTicketUpdated(serializedTicket)
}
