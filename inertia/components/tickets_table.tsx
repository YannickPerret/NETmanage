import type { ReactNode } from 'react'
import { DateTime } from 'luxon'
import { Link } from '@adonisjs/inertia/react'
import DataTable, { type DataTableColumn } from './data_table'

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
  description?: string | null
  createdAt: string
  createdBy: {
    id: number | null
    fullName: string | null
    email: string | null
  }
  status: Status
  priority?: {
    slug: string
    name: string
    level: number
    color: string | null
  } | null
  category?: {
    slug: string
    name: string
  } | null
  company?: {
    id: number
    name: string
  } | null
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
  const columns: DataTableColumn<TicketRow>[] = [
    {
      key: 'id',
      header: '#',
      width: 80,
      render: (ticket) => `#${ticket.id}`,
    },
    {
      key: 'status',
      header: 'Status',
      width: 180,
      render: (ticket) => <StatusBadge status={ticket.status} />,
    },
    {
      key: 'title',
      header: 'Title',
      render: (ticket) => (
        <div className="ticket-title-cell">
          <Link href={`/tickets/${ticket.id}`} className="ticket-title-link">
            {ticket.title}
          </Link>
          <span className="ticket-meta">{formatTicketMeta(ticket)}</span>
        </div>
      ),
    },
    {
      key: 'technicians',
      header: 'Technicians',
      width: 220,
      render: (ticket) => <TechChips technicians={ticket.technicians} />,
    },
  ]

  if (renderActions) {
    columns.push({
      key: 'actions',
      header: '',
      width: 180,
      render: (ticket) => renderActions(ticket),
    })
  }

  return (
    <DataTable
      rows={tickets}
      columns={columns}
      emptyLabel={emptyLabel}
      getRowKey={(ticket) => ticket.id}
      getRowId={(ticket) => `ticket-${ticket.id}`}
    />
  )
}
