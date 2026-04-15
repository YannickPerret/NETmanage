import { DateTime } from 'luxon'
import { Link } from '@adonisjs/inertia/react'
import DataTable, { type DataTableColumn } from '../components/data_table'

type CompanyRow = {
  id: number
  name: string
  code: string | null
  email: string | null
  phone: string | null
  branchCount: number
  clientCount: number
  createdAt: string
}

function formatDate(value: string) {
  const date = DateTime.fromISO(value)
  return date.isValid ? date.toFormat('dd LLL yyyy') : value
}

export default function CompaniesPage({ companies }: { companies: CompanyRow[] }) {
  const columns: DataTableColumn<CompanyRow>[] = [
    { key: 'id', header: '#', width: 80, render: (company) => `#${company.id}` },
    {
      key: 'code',
      header: 'Code',
      width: 120,
      render: (company) =>
        company.code ? <code className="company-code">{company.code}</code> : <span className="muted">—</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (company) => (
        <Link href={`/companies/${company.id}`} className="ticket-title-link">
          {company.name}
        </Link>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      width: 220,
      render: (company) => company.email || <span className="muted">—</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      width: 160,
      render: (company) => company.phone || <span className="muted">—</span>,
    },
    { key: 'branchCount', header: 'Branches', width: 110, render: (company) => company.branchCount },
    { key: 'clientCount', header: 'Clients', width: 110, render: (company) => company.clientCount },
    {
      key: 'createdAt',
      header: 'Created',
      width: 140,
      render: (company) => formatDate(company.createdAt),
    },
  ]

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Companies</h2>
          <span className="section-count">{companies.length}</span>
        </div>

        <DataTable
          rows={companies}
          columns={columns}
          emptyLabel="No companies found."
          getRowKey={(company) => company.id}
        />
      </section>
    </div>
  )
}
