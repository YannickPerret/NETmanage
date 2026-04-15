import type { ReactNode } from 'react'
import { DateTime } from 'luxon'

export type Technician = {
  id: number
  fullName: string | null
  initials: string
}

export type Status = {
  slug: string
  name: string
  color: string | null
} | null

export type TicketRow = {
  id: number
  title: string
  createdAt: string
  createdBy: {
    id: number | null
    fullName: string | null
    email: string | null
  }
  status: Status
  technicians: Technician[]
}

function formatTicketMeta(ticket: TicketRow) {
  const createdBy = ticket.createdBy.fullName ?? ticket.createdBy.email ?? 'Unknown'
  const createdAt = DateTime.fromISO(ticket.createdAt).toFormat('dd LLL yyyy, HH:mm')

  return `Created by ${createdBy} on ${createdAt}`
}

function StatusBadge({ status }: { status: Status }) {
  if (!status) return <>—</>

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: status.color ?? '#6b7280',
        color: '#fff',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {status.name}
    </span>
  )
}

function TechChips({ technicians }: { technicians: Technician[] }) {
  if (technicians.length === 0) return <span className="muted">Unassigned</span>

  return (
    <>
      {technicians.map((tech) => (
        <span
          key={tech.id}
          className="tech-badge"
          title={tech.fullName ?? ''}
          style={{
            display: 'inline-block',
            marginRight: 6,
            padding: '2px 8px',
            borderRadius: 999,
            background: 'var(--gray-3)',
            color: 'var(--gray-10)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {tech.initials}
        </span>
      ))}
    </>
  )
}

export default function TicketsTable({
  tickets,
  emptyLabel,
  renderActions,
}: {
  tickets: TicketRow[]
  emptyLabel: string
  renderActions?: (ticket: TicketRow) => ReactNode
}) {
  if (tickets.length === 0) {
    return <p className="muted" style={{ padding: '16px 4px' }}>{emptyLabel}</p>
  }

  return (
    <table className="tickets-table">
      <thead>
        <tr>
          <th style={{ width: 80 }}>#</th>
          <th style={{ width: 180 }}>Status</th>
          <th>Title</th>
          <th style={{ width: 220 }}>Technicians</th>
          {renderActions && <th style={{ width: 180 }}></th>}
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr key={ticket.id} id={`ticket-${ticket.id}`}>
            <td>#{ticket.id}</td>
            <td><StatusBadge status={ticket.status} /></td>
            <td>
              <div className="ticket-title-cell">
                <span>{ticket.title}</span>
                <span className="ticket-meta">{formatTicketMeta(ticket)}</span>
              </div>
            </td>
            <td><TechChips technicians={ticket.technicians} /></td>
            {renderActions && <td>{renderActions(ticket)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
