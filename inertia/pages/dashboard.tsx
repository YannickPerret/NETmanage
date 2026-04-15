import { useEffect, useRef, useState } from 'react'
import { Data } from '@generated/data'
import { Link, router, usePage } from '@inertiajs/react'
import { DateTime } from 'luxon'
import type { TicketFormOptions } from '../components/create_ticket_modal'
import TicketsTable, { type TicketRow } from '../components/tickets_table'
import {
  createTransmitClient,
  removeTicket,
  type TicketRealtimeEvent,
  upsertTicket,
} from '../lib/ticket_realtime'

type AnnouncementItem = {
  id: number
  title: string
  body: string
  variant: 'info' | 'success' | 'warning' | 'danger'
}

export default function Dashboard({
  awaitingTickets,
  myTickets,
  options: _options,
  announcements = [],
}: {
  awaitingTickets: TicketRow[]
  myTickets: TicketRow[]
  options: TicketFormOptions
  announcements?: AnnouncementItem[]
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

  const createdTodayCount = liveAwaitingTickets.filter((ticket) =>
    DateTime.fromISO(ticket.createdAt).hasSame(DateTime.local(), 'day')
  ).length
  const myActiveCount = liveMyTickets.filter((ticket) =>
    ['in_progress', 'pending'].includes(ticket.status?.slug ?? '')
  ).length
  const secondaryMyTickets = liveMyTickets.slice(0, 3)

  return (
    <div className="dashboard dashboard-glacier">
      <section className="dashboard-hero-grid">
        <article className="glacier-stat-card glacier-stat-card-accent">
          <div className="glacier-stat-copy">
            <span className="glacier-stat-label">
              {user?.type === 'technician' ? 'Awaiting assignment' : 'Open tickets'}
            </span>
            <div className="glacier-stat-value-row">
              <strong>{user?.type === 'technician' ? liveAwaitingTickets.length : liveMyTickets.length}</strong>
              <span>{createdTodayCount > 0 ? `+${createdTodayCount} today` : 'Stable today'}</span>
            </div>
          </div>
          <div className="glacier-stat-ghost">Queue</div>
        </article>

        <article className="glacier-stat-card">
          <div className="glacier-stat-copy">
            <span className="glacier-stat-label">My tickets</span>
            <div className="glacier-stat-value-row">
              <strong>{liveMyTickets.length}</strong>
              <span>{myActiveCount} active</span>
            </div>
          </div>
          <div className="glacier-stat-ghost">Focus</div>
        </article>

        <AnnouncementCarousel announcements={announcements} />
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-primary-column">
          <div className="glacier-section-head">
            <h3>My tickets</h3>
            <Link href="/tickets" className="glacier-inline-link">
              Open all tickets
            </Link>
          </div>

          <TicketsTable
            tickets={liveMyTickets.slice(0, 10)}
            emptyLabel={
              user?.type === 'technician'
                ? 'You are not assigned to any ticket yet.'
                : 'You do not have any ticket yet.'
            }
          />
        </div>

        <aside className="dashboard-secondary-column">
          {user?.type === 'technician' ? (
            <>
              <div className="glacier-section-head">
                <h3>Awaiting assignment</h3>
                <Link href="/tickets?status=awaiting_open" className="glacier-inline-link">
                  View queue
                </Link>
              </div>

              <div className="glacier-ticket-stack">
                {liveAwaitingTickets.length === 0 ? (
                  <article className="glacier-empty-card">
                    No ticket is waiting for assignment right now.
                  </article>
                ) : (
                  liveAwaitingTickets.slice(0, 6).map((ticket) => (
                    <AwaitingTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onOpen={() => router.post(`/tickets/${ticket.id}/open`)}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="glacier-section-head">
                <h3>My tickets</h3>
                <span className="glacier-pill">{liveMyTickets.length} active</span>
              </div>
              <div className="glacier-mini-stack">
                {secondaryMyTickets.map((ticket) => (
                  <CompactTicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </>
          )}

        </aside>
      </section>
    </div>
  )
}

function formatAbsoluteDate(value: string) {
  const date = DateTime.fromISO(value)
  if (!date.isValid) return value
  if (date.hasSame(DateTime.local(), 'day')) return `Today, ${date.toFormat('HH:mm')}`
  if (date.hasSame(DateTime.local().minus({ days: 1 }), 'day')) return `Yesterday, ${date.toFormat('HH:mm')}`
  return date.toFormat('dd LLL, HH:mm')
}

function AwaitingTicketCard({
  ticket,
  onOpen,
}: {
  ticket: TicketRow
  onOpen: () => void
}) {
  return (
    <article className="glacier-awaiting-card">
      <div className="glacier-ticket-meta-row">
        <div className="glacier-ticket-meta-group">
          <span className="glacier-ticket-id">#{ticket.id}</span>
          <span className="glacier-status-pill is-awaiting">
            {ticket.status?.name ?? 'Awaiting assignment'}
          </span>
        </div>
        <span className="glacier-time-label">{formatAbsoluteDate(ticket.createdAt)}</span>
      </div>

      <Link href={`/tickets/${ticket.id}`} className="glacier-ticket-title">
        {ticket.title}
      </Link>

      <div className="glacier-card-footer">
        <div className="glacier-user-row glacier-user-row-compact">
          <div className="glacier-avatar-badge">
            {ticket.createdBy.fullName?.slice(0, 1) ?? ticket.createdBy.email?.slice(0, 1) ?? '?'}
          </div>
          <div>
            <strong>{ticket.createdBy.fullName ?? ticket.createdBy.email ?? 'Unknown'}</strong>
          </div>
        </div>

        <button type="button" className="glacier-action-button" onClick={onOpen}>
          Assign to me
        </button>
      </div>
    </article>
  )
}

function AnnouncementCarousel({ announcements }: { announcements: AnnouncementItem[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const total = announcements.length
  const safeIndex = total === 0 ? 0 : Math.min(index, total - 1)

  useEffect(() => {
    if (total <= 1 || paused) return
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % total)
    }, 6000)
    return () => window.clearInterval(interval)
  }, [total, paused])

  useEffect(() => {
    if (safeIndex !== index) setIndex(safeIndex)
  }, [safeIndex, index])

  if (total === 0) {
    return (
      <article className="glacier-announcement-card is-empty">
        <div className="glacier-announcement-body">
          <span className="glacier-announcement-variant is-info">Announcements</span>
          <h3>No announcement</h3>
          <p>Nothing to share right now. Super-admins can publish updates from the admin panel.</p>
        </div>
      </article>
    )
  }

  const current = announcements[safeIndex]

  const goTo = (next: number) => {
    setIndex(((next % total) + total) % total)
  }

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
    setPaused(true)
  }

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartX.current
    touchStartX.current = null
    setPaused(false)
    if (start === null) return
    const end = event.changedTouches[0]?.clientX ?? start
    const delta = end - start
    if (Math.abs(delta) < 40) return
    goTo(delta < 0 ? safeIndex + 1 : safeIndex - 1)
  }

  return (
    <article
      className={`glacier-announcement-card is-${current.variant}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="glacier-announcement-body" key={current.id}>
        <span className={`glacier-announcement-variant is-${current.variant}`}>
          {current.variant}
        </span>
        <h3>{current.title}</h3>
        <p>{current.body}</p>
      </div>

      {total > 1 && (
        <div className="glacier-announcement-controls">
          <button
            type="button"
            className="glacier-announcement-nav"
            onClick={() => goTo(safeIndex - 1)}
            aria-label="Previous announcement"
          >
            ‹
          </button>
          <div className="glacier-announcement-dots" role="tablist">
            {announcements.map((item, idx) => (
              <button
                type="button"
                key={item.id}
                className={`glacier-announcement-dot ${idx === safeIndex ? 'is-active' : ''}`}
                onClick={() => goTo(idx)}
                aria-label={`Show announcement ${idx + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="glacier-announcement-nav"
            onClick={() => goTo(safeIndex + 1)}
            aria-label="Next announcement"
          >
            ›
          </button>
        </div>
      )}
    </article>
  )
}

function CompactTicketCard({ ticket }: { ticket: TicketRow }) {
  return (
    <Link href={`/tickets/${ticket.id}`} className="glacier-compact-card">
      <div className="glacier-ticket-meta-row">
        <span className="glacier-ticket-id">#{ticket.id}</span>
        <span className={`glacier-compact-status is-${ticket.status?.slug ?? 'default'}`}>
          {ticket.status?.name ?? 'Unknown'}
        </span>
      </div>
      <strong>{ticket.title}</strong>
    </Link>
  )
}
