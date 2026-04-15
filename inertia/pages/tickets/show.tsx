import { DateTime } from 'luxon'
import { Form, Link } from '@adonisjs/inertia/react'
import type { TicketRow } from '../../components/tickets_table'

type TicketDetail = {
  id: number
  title: string
  description: string
  createdAt: string
  status: {
    slug: string
    name: string
    color: string | null
  } | null
  priority: {
    id: number
    name: string
    color: string | null
  } | null
  category: {
    id: number
    name: string
    slug: string
  } | null
  createdBy: {
    id: number | null
    fullName: string | null
    email: string | null
  }
  issuer: {
    type: string
    id: number
    label: string | null
    email: string | null
  } | null
  technicians: Array<{
    id: number
    fullName: string | null
    initials: string
  }>
  groups: Array<{
    id: number
    name: string
    slug: string
  }>
  parentTicket: TicketRow | null
  childTickets: TicketRow[]
  events: Array<{
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
  }>
  canManageRelations: boolean
}

function formatDate(value: string) {
  const date = DateTime.fromISO(value)
  return date.isValid ? date.toFormat('dd LLL yyyy HH:mm') : value
}

function TicketLinkCard({ ticket }: { ticket: TicketRow }) {
  return (
    <Link href={`/tickets/${ticket.id}`} className="ticket-link-card">
      <div className="ticket-link-card-head">
        <strong>#{ticket.id}</strong>
        {ticket.status && (
          <span className="status-badge" style={{ backgroundColor: ticket.status.color ?? '#6b7280' }}>
            {ticket.status.name}
          </span>
        )}
      </div>
      <span>{ticket.title}</span>
      <span className="ticket-meta">
        {ticket.createdBy.fullName ?? ticket.createdBy.email ?? 'Unknown'} · {formatDate(ticket.createdAt)}
      </span>
    </Link>
  )
}

export default function TicketShowPage({ ticket }: { ticket: TicketDetail }) {
  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="ticket-detail-head">
          <div>
            <p className="ticket-meta">Ticket #{ticket.id}</p>
            <h1>{ticket.title}</h1>
            <p className="ticket-meta">
              Created {formatDate(ticket.createdAt)} by{' '}
              {ticket.createdBy.fullName ?? ticket.createdBy.email ?? 'Unknown'}
            </p>
          </div>
          <Link href="/tickets" className="btn btn-ghost">
            Back to tickets
          </Link>
        </div>

        <div className="ticket-detail-tags">
          {ticket.status && (
            <span className="status-badge" style={{ backgroundColor: ticket.status.color ?? '#6b7280' }}>
              {ticket.status.name}
            </span>
          )}
          {ticket.priority && (
            <span className="priority-badge" style={{ borderColor: ticket.priority.color ?? '#d1d5db' }}>
              {ticket.priority.name}
            </span>
          )}
          {ticket.category && <span className="priority-badge">{ticket.category.name}</span>}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Details</h2>
        </div>

        <div className="ticket-detail-grid">
          <article className="ticket-detail-card">
            <h3>Description</h3>
            <p className="ticket-detail-description">{ticket.description}</p>
          </article>

          <article className="ticket-detail-card">
            <h3>Context</h3>
            <div className="company-client-list">
              <div className="company-client-item">
                <strong>Issuer</strong>
                <span>{ticket.issuer?.label ?? 'Unknown'}</span>
              </div>
              <div className="company-client-item">
                <strong>Issuer email</strong>
                <span>{ticket.issuer?.email ?? 'No email'}</span>
              </div>
              <div className="company-client-item">
                <strong>Groups</strong>
                <span>{ticket.groups.length > 0 ? ticket.groups.map((group) => group.name).join(', ') : 'None'}</span>
              </div>
            </div>
          </article>

          <article className="ticket-detail-card">
            <h3>Assigned technicians</h3>
            <div className="company-client-list">
              {ticket.technicians.length === 0 ? (
                <span className="ticket-meta">No technician assigned yet.</span>
              ) : (
                ticket.technicians.map((technician) => (
                  <div key={technician.id} className="company-client-item">
                    <strong>{technician.fullName || technician.initials}</strong>
                    <span>{technician.initials}</span>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Linked tickets</h2>
        </div>

        <div className="ticket-detail-grid">
          <article className="ticket-detail-card">
            <h3>Parent ticket</h3>
            {ticket.parentTicket ? (
              <div className="ticket-detail-parent-block">
                <TicketLinkCard ticket={ticket.parentTicket} />
                {ticket.canManageRelations && (
                  <Form action={`/tickets/${ticket.id}/parent/remove`} method="post">
                    <button type="submit" className="btn btn-ghost">
                      Remove parent
                    </button>
                  </Form>
                )}
              </div>
            ) : (
              <p className="ticket-meta">No parent ticket linked.</p>
            )}

            {ticket.canManageRelations && (
              <Form action={`/tickets/${ticket.id}/parent`} method="post" className="ticket-parent-form">
                <label htmlFor="parentTicketId">Link to parent ticket</label>
                <div className="ticket-parent-form-row">
                  <input
                    id="parentTicketId"
                    name="parentTicketId"
                    type="number"
                    min={1}
                    placeholder="Parent ticket id"
                    required
                  />
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </Form>
            )}
          </article>

          <article className="ticket-detail-card">
            <h3>Child tickets</h3>
            {ticket.childTickets.length === 0 ? (
              <p className="ticket-meta">No child tickets linked.</p>
            ) : (
              <div className="ticket-link-list">
                {ticket.childTickets.map((childTicket) => (
                  <TicketLinkCard key={childTicket.id} ticket={childTicket} />
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>History</h2>
          <span className="section-count">{ticket.events.length}</span>
        </div>

        {ticket.events.length === 0 ? (
          <p className="ticket-meta">No history entry yet.</p>
        ) : (
          <div className="ticket-timeline">
            {ticket.events.map((event) => (
              <article key={event.id} className="ticket-event-card">
                <div className="ticket-event-head">
                  <strong>{event.description}</strong>
                  <span className="ticket-meta">{formatDate(event.createdAt)}</span>
                </div>
                <p className="ticket-meta">
                  {event.actor ? `Actor: ${event.actor.fullName ?? event.actor.email ?? 'Unknown'}` : 'System event'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
