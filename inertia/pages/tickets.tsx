import { useEffect, useState } from 'react'
import { Data } from '@generated/data'
import { router, usePage } from '@inertiajs/react'
import type { TicketFormOptions } from '../components/create_ticket_modal'
import TicketsTable, { type TicketRow } from '../components/tickets_table'
import {
  createTransmitClient,
  ticketsIndexChannel,
  type TicketRealtimeEvent,
  upsertTicket,
} from '../lib/ticket_realtime'

export default function TicketsPage({
  tickets,
  options: _options,
}: {
  tickets: TicketRow[]
  options: TicketFormOptions
}) {
  const page = usePage<Data.SharedProps>()
  const user = page.props.user
  const [liveTickets, setLiveTickets] = useState(tickets)

  useEffect(() => {
    setLiveTickets(tickets)
  }, [tickets])

  useEffect(() => {
    if (typeof window === 'undefined' || !user) {
      return
    }

    const transmit = createTransmitClient()
    const subscription = transmit.subscription(ticketsIndexChannel(user))
    const removeHandler = subscription.onMessage((message: TicketRealtimeEvent) => {
      if (message.type === 'tickets:upsert') {
        setLiveTickets((current) => upsertTicket(current, message.ticket))
      }
    })

    void subscription.create()

    return () => {
      removeHandler()
      void subscription.delete()
      transmit.close()
    }
  }, [user])

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="section-header">
          <h2>{user?.type === 'technician' ? 'All tickets' : 'My tickets'}</h2>
          <span className="section-count">{liveTickets.length}</span>
        </div>
        <TicketsTable
          tickets={liveTickets}
          emptyLabel="No tickets found."
          renderActions={(ticket) => {
            if (user?.type !== 'technician') {
              return null
            }

            const isAssigned = ticket.technicians.some((technician) => technician.id === user.id)
            const canResolve = isAssigned && ['in_progress', 'pending'].includes(ticket.status?.slug ?? '')

            if (!canResolve) {
              return null
            }

            return (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '4px 12px', fontSize: 13 }}
                onClick={() => router.post(`/tickets/${ticket.id}/resolve`)}
              >
                Resolve
              </button>
            )
          }}
        />
      </section>
    </div>
  )
}
