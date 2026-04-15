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

export default function Dashboard({ tickets }: { tickets: TicketRow[] }) {
  return (
    <div className="dashboard">
      <h1>Tickets</h1>

      {tickets.length === 0 ? (
        <p>Aucun ticket pour le moment.</p>
      ) : (
        <table className="tickets-table">
          <thead>
            <tr>
              <th>#</th>
              <th>État</th>
              <th>Titre</th>
              <th>Techniciens</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>
                  {t.status ? (
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: t.status.color ?? '#6b7280',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: 12,
                      }}
                    >
                      {t.status.name}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td>{t.title}</td>
                <td>
                  {t.technicians.length === 0
                    ? '—'
                    : t.technicians.map((tech) => (
                        <span
                          key={tech.id}
                          className="tech-badge"
                          title={tech.fullName ?? ''}
                          style={{
                            display: 'inline-block',
                            marginRight: 6,
                            padding: '2px 6px',
                            borderRadius: 999,
                            background: '#e5e7eb',
                            fontSize: 12,
                          }}
                        >
                          {tech.initials}
                        </span>
                      ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
