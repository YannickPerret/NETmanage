import Ticket from '#models/ticket'
import TicketSatisfaction from '#models/ticket_satisfaction'
import User from '#models/user'
import Status from '#models/status'
import {
  sendTicketClosureConfirmationRequest,
  sendTicketClosedSatisfactionRequest,
} from '#services/ticket_mailer'
import { broadcastTicketState, loadRealtimeTicket } from '#services/ticket_realtime'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'

export const RESOLVED_SLUG = 'resolved'
export const CLOSED_SLUG = 'closed'

function generateToken() {
  return randomBytes(24).toString('hex')
}

async function closeTicketInternal(ticket: Ticket, client: User | null) {
  const closedStatus = await Status.findByOrFail('slug', CLOSED_SLUG)

  ticket.statusId = closedStatus.id
  ticket.closedAt = DateTime.utc()
  ticket.closeConfirmationToken = null
  ticket.satisfactionToken = generateToken()
  ticket.satisfactionRequestedAt = DateTime.utc()
  await ticket.save()

  const realtimeTicket = await loadRealtimeTicket(ticket)
  broadcastTicketState(ticket, realtimeTicket)

  if (client) {
    await sendTicketClosedSatisfactionRequest(ticket, client)
  }
}

export async function markTicketResolved(ticket: Ticket, client: User | null) {
  const resolvedStatus = await Status.findByOrFail('slug', RESOLVED_SLUG)

  ticket.statusId = resolvedStatus.id
  ticket.resolvedAt = DateTime.utc()
  ticket.closedAt = null
  ticket.closeConfirmationToken = generateToken()
  ticket.closeConfirmationSentAt = DateTime.utc()
  ticket.satisfactionToken = null
  ticket.satisfactionRequestedAt = null
  ticket.satisfactionSubmittedAt = null
  await ticket.save()

  const realtimeTicket = await loadRealtimeTicket(ticket)
  broadcastTicketState(ticket, realtimeTicket)

  if (client) {
    await sendTicketClosureConfirmationRequest(ticket, client)
  }
}

export async function closeTicketAfterClientConfirmation(ticket: Ticket, client: User | null) {
  await closeTicketInternal(ticket, client)
}

export async function autoCloseTicket(ticket: Ticket, client: User | null) {
  await closeTicketInternal(ticket, client)
}

export async function submitTicketSatisfaction(
  ticket: Ticket,
  client: User,
  payload: { rating: number; comment?: string | null }
) {
  await ticket.load('technicians', (query) => query.select('id', 'full_name', 'email'))

  if (ticket.technicians.length === 0) {
    ticket.satisfactionToken = null
    ticket.satisfactionSubmittedAt = DateTime.utc()
    await ticket.save()
    return
  }

  await Promise.all(
    ticket.technicians.map((technician) =>
      TicketSatisfaction.updateOrCreate(
        {
          ticketId: ticket.id,
          technicianId: technician.id,
          submittedByUserId: client.id,
        },
        {
          rating: payload.rating,
          comment: payload.comment?.trim() || null,
        }
      )
    )
  )

  ticket.satisfactionToken = null
  ticket.satisfactionSubmittedAt = DateTime.utc()
  await ticket.save()
}

export function isAutoCloseDue(ticket: Ticket) {
  if (!ticket.resolvedAt) {
    return false
  }

  return ticket.resolvedAt <= DateTime.utc().minus({ days: 2 })
}
