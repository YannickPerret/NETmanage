import { useState } from 'react'
import { DateTime } from 'luxon'
import { Link } from '@adonisjs/inertia/react'

type CompanyDetail = {
  id: number
  name: string
  code: string | null
  email: string | null
  phone: string | null
  createdAt: string
  branchCount: number
  clientCount: number
  branches: Array<{
    id: number
    name: string
    address: string | null
    city: string | null
    country: string | null
    clientCount: number
    clients: Array<{
      id: number
      fullName: string | null
      email: string
    }>
  }>
  recentTickets: Array<{
    id: number
    title: string
    createdAt: string
    issuerLabel: string
    status: {
      slug: string
      name: string
      color: string | null
    } | null
    priority: {
      name: string
      color: string | null
    } | null
    createdBy: {
      id: number | null
      fullName: string | null
      email: string | null
    }
    technicians: Array<{
      id: number
      fullName: string | null
      initials: string
    }>
  }>
}

function formatDate(value: string) {
  const date = DateTime.fromISO(value)
  return date.isValid ? date.toFormat('dd LLL yyyy HH:mm') : value
}

type CompanyTab = 'overview' | 'branches' | 'tickets'

export default function CompanyShowPage({ company }: { company: CompanyDetail }) {
  const [activeTab, setActiveTab] = useState<CompanyTab | 'employees'>('overview')
  const employees = company.branches.flatMap((branch) =>
    branch.clients.map((client) => ({
      ...client,
      branchId: branch.id,
      branchName: branch.name,
    }))
  )

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="company-page-head">
          <div>
            <p className="ticket-meta">Company</p>
            <h1>{company.name}</h1>
            <p className="company-contact-line">
              {company.code && <span><code className="company-code">{company.code}</code></span>}
              <span>{company.email || 'No email'}</span>
              <span>{company.phone || 'No phone'}</span>
              <span>Created {formatDate(company.createdAt)}</span>
            </p>
          </div>
          <Link href="/companies" className="btn btn-ghost">
            Back to companies
          </Link>
        </div>

        <div className="company-kpis">
          <div className="satisfaction-stat">
            <span className="satisfaction-stat-label">Branches</span>
            <span className="satisfaction-stat-value">{company.branchCount}</span>
          </div>
          <div className="satisfaction-stat">
            <span className="satisfaction-stat-label">Employees</span>
            <span className="satisfaction-stat-value">{employees.length}</span>
          </div>
          <div className="satisfaction-stat">
            <span className="satisfaction-stat-label">Recent tickets</span>
            <span className="satisfaction-stat-value">{company.recentTickets.length}</span>
          </div>
        </div>

        <div className="company-tabs" role="tablist" aria-label="Company sections">
          <button
            type="button"
            className={`company-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={`company-tab ${activeTab === 'branches' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'branches'}
            onClick={() => setActiveTab('branches')}
          >
            Branches
            <span className="section-count">{company.branches.length}</span>
          </button>
          <button
            type="button"
            className={`company-tab ${activeTab === 'employees' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'employees'}
            onClick={() => setActiveTab('employees')}
          >
            Employees
            <span className="section-count">{employees.length}</span>
          </button>
          <button
            type="button"
            className={`company-tab ${activeTab === 'tickets' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'tickets'}
            onClick={() => setActiveTab('tickets')}
          >
            Tickets
            <span className="section-count">{company.recentTickets.length}</span>
          </button>
        </div>
      </section>

      {activeTab === 'overview' && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Overview</h2>
          </div>

          <div className="company-overview-grid">
            <article className="company-overview-card">
              <h3>Contact</h3>
              <div className="company-client-list">
                <div className="company-client-item">
                  <strong>Email</strong>
                  <span>{company.email || 'No email'}</span>
                </div>
                <div className="company-client-item">
                  <strong>Phone</strong>
                  <span>{company.phone || 'No phone'}</span>
                </div>
                <div className="company-client-item">
                  <strong>Created</strong>
                  <span>{formatDate(company.createdAt)}</span>
                </div>
              </div>
            </article>

            <article className="company-overview-card">
              <h3>Structure</h3>
              <div className="company-client-list">
                <div className="company-client-item">
                  <strong>Branches</strong>
                  <span>{company.branchCount}</span>
                </div>
                <div className="company-client-item">
                  <strong>Employees</strong>
                  <span>{employees.length}</span>
                </div>
                <div className="company-client-item">
                  <strong>Recent tickets</strong>
                  <span>{company.recentTickets.length}</span>
                </div>
              </div>
            </article>

            <article className="company-overview-card">
              <h3>Latest branch snapshot</h3>
              <div className="company-client-list">
                {company.branches.length === 0 ? (
                  <span className="ticket-meta">No branches yet.</span>
                ) : (
                  company.branches.slice(0, 3).map((branch) => (
                    <div key={branch.id} className="company-client-item">
                      <strong>{branch.name}</strong>
                      <span>{branch.clientCount} employees</span>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </section>
      )}

      {activeTab === 'branches' && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Branches</h2>
            <span className="section-count">{company.branches.length}</span>
          </div>

          <div className="company-branch-grid">
            {company.branches.map((branch) => (
              <article key={branch.id} className="company-branch-card">
                <div className="company-branch-head">
                  <h3>{branch.name}</h3>
                  <span className="ticket-meta">{branch.clientCount} employees</span>
                </div>
                <p className="company-branch-address">
                  {[branch.address, branch.city, branch.country].filter(Boolean).join(', ') || 'No address'}
                </p>
                <div className="company-client-list">
                  {branch.clients.length === 0 ? (
                    <span className="ticket-meta">No employees in this branch.</span>
                  ) : (
                    branch.clients.map((client) => (
                      <div key={client.id} className="company-client-item">
                        <strong>{client.fullName || client.email}</strong>
                        <span>{client.email}</span>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'employees' && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Employees</h2>
            <span className="section-count">{employees.length}</span>
          </div>

          {employees.length === 0 ? (
            <p className="ticket-meta">No employees linked to this company yet.</p>
          ) : (
            <div className="company-employee-grid">
              {employees.map((employee) => (
                <article key={employee.id} className="company-branch-card">
                  <div className="company-branch-head">
                    <h3>{employee.fullName || employee.email}</h3>
                    <span className="ticket-meta">{employee.branchName}</span>
                  </div>
                  <p className="company-branch-address">{employee.email}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'tickets' && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent tickets</h2>
            <span className="section-count">{company.recentTickets.length}</span>
          </div>

          {company.recentTickets.length === 0 ? (
            <p className="ticket-meta">No tickets linked to this company yet.</p>
          ) : (
            <div className="company-ticket-list">
              {company.recentTickets.map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="company-ticket-card">
                  <div className="company-ticket-head">
                    <h3>{ticket.title}</h3>
                    <span className="ticket-meta">#{ticket.id}</span>
                  </div>
                  <p className="ticket-meta">
                    Issuer {ticket.issuerLabel} · Created {formatDate(ticket.createdAt)}
                  </p>
                  <div className="company-ticket-tags">
                    {ticket.status && (
                      <span className="status-badge" style={{ backgroundColor: ticket.status.color ?? '#e5e7eb' }}>
                        {ticket.status.name}
                      </span>
                    )}
                    {ticket.priority && (
                      <span className="priority-badge" style={{ borderColor: ticket.priority.color ?? '#d1d5db' }}>
                        {ticket.priority.name}
                      </span>
                    )}
                  </div>
                  <p className="ticket-meta">
                    Created by {ticket.createdBy.fullName || ticket.createdBy.email || 'Unknown'} · Assigned to{' '}
                    {ticket.technicians.length > 0
                      ? ticket.technicians.map((technician) => technician.fullName || technician.initials).join(', ')
                      : 'nobody'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
