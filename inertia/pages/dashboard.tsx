import { useEffect, useState } from 'react'
import { Data } from '@generated/data'
import { router, usePage } from '@inertiajs/react'
import type { TicketFormOptions } from '../components/create_ticket_modal'
import TicketsTable, { type TicketRow } from '../components/tickets_table'
import {
  createTransmitClient,
  removeTicket,
  type TicketRealtimeEvent,
  upsertTicket,
} from '../lib/ticket_realtime'

export default function Dashboard({
  awaitingTickets,
  myTickets,
  options: _options,
}: {
  awaitingTickets: TicketRow[]
  myTickets: TicketRow[]
  options: TicketFormOptions
}) {
  const page = usePage<Data.SharedProps>()
  const user = page.props.user
  const [liveAwaitingTickets, setLiveAwaitingTickets] = useState(awaitingTickets)
  const [liveMyTickets, setLiveMyTickets] = useState(myTickets)

  useEffect(() => {
    setLiveAwaitingTickets(awaitingTickets)
  }, [awaitingTickets])

  useEffect(() => {
    setLiveMyTickets(myTickets)
  }, [myTickets])

  useEffect(() => {
    if (typeof window === 'undefined' || !user || user.type !== 'technician') {
      return
    }

    const transmit = createTransmitClient()
    const awaitingSubscription = transmit.subscription('tickets/awaiting')
    const removeAwaitingHandler = awaitingSubscription.onMessage((message: TicketRealtimeEvent) => {
      if (message.type === 'awaiting:upsert') {
        setLiveAwaitingTickets((current) => upsertTicket(current, message.ticket))
        return
      }

      if (message.type === 'awaiting:remove') {
        setLiveAwaitingTickets((current) => removeTicket(current, message.ticketId))
      }
    })

    void awaitingSubscription.create()

    const mineSubscription = transmit.subscription(`technicians/${user.id}/tickets`)
    const removeMineHandler = mineSubscription.onMessage((message: TicketRealtimeEvent) => {
      if (message.type === 'mine:remove') {
        setLiveMyTickets((current) => removeTicket(current, message.ticketId))
        return
      }

      if (message.type !== 'mine:upsert') {
        return
      }

      setLiveMyTickets((current) => upsertTicket(current, message.ticket))
      setLiveAwaitingTickets((current) => removeTicket(current, message.ticket.id))
    })

    void mineSubscription.create()

    return () => {
      removeAwaitingHandler()
      removeMineHandler()
      void awaitingSubscription.delete()
      void mineSubscription.delete()
      transmit.close()
    }
  }, [user?.id, user?.type])

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Awaiting assignment</h2>
          <span className="section-count">{liveAwaitingTickets.length}</span>
        </div>
        <TicketsTable
          tickets={liveAwaitingTickets}
          emptyLabel="No ticket awaiting assignment."
          renderActions={(ticket) => (
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '4px 12px', fontSize: 13 }}
              onClick={() => router.post(`/tickets/${ticket.id}/open`)}
            >
              Open
            </button>
          )}
        />
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>My tickets</h2>
          <span className="section-count">{liveMyTickets.length}</span>
        </div>
        <TicketsTable
          tickets={liveMyTickets}
          emptyLabel="You are not assigned to any ticket yet."
          renderActions={(ticket) => {
            const canResolve = ['in_progress', 'pending'].includes(ticket.status?.slug ?? '')

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
