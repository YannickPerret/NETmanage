import { router } from '@inertiajs/react'

type Technician = {
  id: number
  fullName: string | null
  initials: string
}

type Status = {
  slug: string
  name: string
  color: string | null
} | null

type TicketRow = {
  id: number
  title: string
  status: Status
  technicians: Technician[]
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

function TicketsTable({
  tickets,
  emptyLabel,
  showOpenAction = false,
}: {
  tickets: TicketRow[]
  emptyLabel: string
  showOpenAction?: boolean
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
          {showOpenAction && <th style={{ width: 100 }}></th>}
        </tr>
      </thead>
      <tbody>
        {tickets.map((t) => (
          <tr key={t.id}>
            <td>#{t.id}</td>
            <td><StatusBadge status={t.status} /></td>
            <td>{t.title}</td>
            <td><TechChips technicians={t.technicians} /></td>
            {showOpenAction && (
              <td>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '4px 12px', fontSize: 13 }}
                  onClick={() => router.post(`/tickets/${t.id}/open`)}
                >
                  Open
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Dashboard({
  awaitingTickets,
  myTickets,
}: {
  awaitingTickets: TicketRow[]
  myTickets: TicketRow[]
}) {
  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Awaiting assignment</h2>
          <span className="section-count">{awaitingTickets.length}</span>
        </div>
        <TicketsTable
          tickets={awaitingTickets}
          emptyLabel="No ticket awaiting assignment."
          showOpenAction
        />
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>My tickets</h2>
          <span className="section-count">{myTickets.length}</span>
        </div>
        <TicketsTable
          tickets={myTickets}
          emptyLabel="You are not assigned to any ticket yet."
        />
      </section>
    </div>
  )
}
