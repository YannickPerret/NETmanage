import { useEffect, useMemo, useState } from 'react'
import { Data } from '@generated/data'
import { router, usePage } from '@inertiajs/react'
import type { TicketFormOptions } from '../components/create_ticket_modal'
import TicketsTable, { type TicketRow } from '../components/tickets_table'
import TicketsAdvancedFilter, {
  applyTicketFilters,
  EMPTY_FILTERS,
  filtersFromQueryString,
  type TicketFilters,
} from '../components/tickets_advanced_filter'
import {
  createTransmitClient,
  ticketsIndexChannel,
  type TicketRealtimeEvent,
  upsertTicket,
} from '../lib/ticket_realtime'

export default function TicketsPage({
  tickets,
  options,
}: {
  tickets: TicketRow[]
  options: TicketFormOptions
}) {
  const page = usePage<Data.SharedProps>()
  const user = page.props.user
  const [liveTickets, setLiveTickets] = useState(tickets)

  const [filters, setFilters] = useState<TicketFilters>(() => {
    const queryIndex = page.url.indexOf('?')
    return queryIndex === -1 ? EMPTY_FILTERS : filtersFromQueryString(page.url.slice(queryIndex))
  })

  useEffect(() => {
    setLiveTickets(tickets)
  }, [tickets])

  useEffect(() => {
    const queryIndex = page.url.indexOf('?')
    if (queryIndex === -1) {
      setFilters(EMPTY_FILTERS)
      return
    }
    setFilters(filtersFromQueryString(page.url.slice(queryIndex)))
  }, [page.url])

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

  const filteredTickets = useMemo(
    () => applyTicketFilters(liveTickets, filters),
    [liveTickets, filters]
  )

  const resetFilters = () => setFilters(EMPTY_FILTERS)

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="section-header">
          <h2>{user?.type === 'technician' ? 'All tickets' : 'My tickets'}</h2>
          <span className="section-count">{filteredTickets.length}</span>
        </div>

        <TicketsAdvancedFilter
          options={options}
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          totalCount={liveTickets.length}
          filteredCount={filteredTickets.length}
        />

        <TicketsTable
          tickets={filteredTickets}
          emptyLabel={
            liveTickets.length === 0
              ? 'No tickets found.'
              : 'No tickets match the current filters.'
          }
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
