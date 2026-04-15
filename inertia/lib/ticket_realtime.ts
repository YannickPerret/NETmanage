import { Transmit } from '@adonisjs/transmit-client'
import type { Data } from '@generated/data'
import type { TicketRow } from '../components/tickets_table'

export type TicketRealtimeEvent =
  | { type: 'awaiting:upsert'; ticket: TicketRow }
  | { type: 'awaiting:remove'; ticketId: number }
  | { type: 'mine:upsert'; ticket: TicketRow }
  | { type: 'mine:remove'; ticketId: number }
  | { type: 'tickets:upsert'; ticket: TicketRow }
  | { type: 'ticket:updated'; ticket: TicketRow }

export function upsertTicket(tickets: TicketRow[], nextTicket: TicketRow) {
  return [nextTicket, ...tickets.filter((ticket) => ticket.id !== nextTicket.id)].sort(
    (a, b) => b.id - a.id
  )
}

export function removeTicket(tickets: TicketRow[], ticketId: number) {
  return tickets.filter((ticket) => ticket.id !== ticketId)
}

export function createTransmitClient() {
  return new Transmit({ baseUrl: window.location.origin })
}

export function ticketsIndexChannel(user: Data.User) {
  return user.type === 'technician' ? 'tickets/index' : `users/${user.id}/tickets/index`
}
