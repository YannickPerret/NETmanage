import { useEffect, useMemo, useState } from 'react'
import { DateTime } from 'luxon'
import type { TicketRow } from './tickets_table'
import type { TicketFormOptions } from './create_ticket_modal'

export type TicketFilters = {
  id: string
  title: string
  description: string
  statusSlug: string
  prioritySlug: string
  categorySlug: string
  technicianId: string
  companyId: string
  createdFrom: string
  createdTo: string
}

export const EMPTY_FILTERS: TicketFilters = {
  id: '',
  title: '',
  description: '',
  statusSlug: '',
  prioritySlug: '',
  categorySlug: '',
  technicianId: '',
  companyId: '',
  createdFrom: '',
  createdTo: '',
}

export function filtersFromQueryString(search: string): TicketFilters {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  return {
    id: params.get('id') ?? '',
    title: params.get('title') ?? '',
    description: params.get('description') ?? '',
    statusSlug: params.get('status') ?? '',
    prioritySlug: params.get('priority') ?? '',
    categorySlug: params.get('category') ?? '',
    technicianId: params.get('technician') ?? '',
    companyId: params.get('company') ?? '',
    createdFrom: params.get('from') ?? '',
    createdTo: params.get('to') ?? '',
  }
}

export function hasActiveFilters(filters: TicketFilters): boolean {
  return Object.values(filters).some((value) => value.trim().length > 0)
}

export function applyTicketFilters(tickets: TicketRow[], filters: TicketFilters): TicketRow[] {
  const idTerm = filters.id.trim()
  const titleTerm = filters.title.trim().toLowerCase()
  const descriptionTerm = filters.description.trim().toLowerCase()
  const fromDate = filters.createdFrom ? DateTime.fromISO(filters.createdFrom) : null
  const toDate = filters.createdTo ? DateTime.fromISO(filters.createdTo).endOf('day') : null
  const technicianId = filters.technicianId ? Number(filters.technicianId) : null
  const companyId = filters.companyId ? Number(filters.companyId) : null

  return tickets.filter((ticket) => {
    if (idTerm && !String(ticket.id).includes(idTerm)) return false
    if (titleTerm && !ticket.title.toLowerCase().includes(titleTerm)) return false
    if (descriptionTerm && !(ticket.description ?? '').toLowerCase().includes(descriptionTerm)) {
      return false
    }
    if (filters.statusSlug && ticket.status?.slug !== filters.statusSlug) return false
    if (filters.prioritySlug && ticket.priority?.slug !== filters.prioritySlug) return false
    if (filters.categorySlug && ticket.category?.slug !== filters.categorySlug) return false
    if (technicianId !== null && !ticket.technicians.some((tech) => tech.id === technicianId)) {
      return false
    }
    if (companyId !== null && ticket.company?.id !== companyId) return false

    if (fromDate || toDate) {
      const created = DateTime.fromISO(ticket.createdAt)
      if (!created.isValid) return false
      if (fromDate && created < fromDate) return false
      if (toDate && created > toDate) return false
    }

    return true
  })
}

export default function TicketsAdvancedFilter({
  options,
  filters,
  onChange,
  onReset,
  totalCount,
  filteredCount,
}: {
  options: TicketFormOptions
  filters: TicketFilters
  onChange: (filters: TicketFilters) => void
  onReset: () => void
  totalCount: number
  filteredCount: number
}) {
  const [expanded, setExpanded] = useState<boolean>(() => hasActiveFilters(filters))

  useEffect(() => {
    if (hasActiveFilters(filters)) setExpanded(true)
  }, [filters])

  const activeCount = useMemo(
    () => Object.values(filters).filter((value) => value.trim().length > 0).length,
    [filters]
  )

  const update = <K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <section className="advanced-filter">
      <header className="advanced-filter-header">
        <button
          type="button"
          className="advanced-filter-toggle"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          <span className="advanced-filter-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 5h16l-6 8v5l-4 2v-7L4 5z" />
            </svg>
          </span>
          <span>Filters</span>
          {activeCount > 0 && <span className="advanced-filter-count">{activeCount}</span>}
          <span className={`advanced-filter-caret ${expanded ? 'is-open' : ''}`}>▾</span>
        </button>

        <div className="advanced-filter-summary">
          {activeCount > 0 && (
            <button type="button" className="btn btn-ghost advanced-filter-reset" onClick={onReset}>
              Clear all
            </button>
          )}
        </div>
      </header>

      {expanded && (
        <div className="advanced-filter-grid">
          <label className="advanced-filter-field">
            <span>Ticket ID</span>
            <input
              type="text"
              inputMode="numeric"
              value={filters.id}
              onChange={(event) => update('id', event.target.value)}
              placeholder="e.g. 128"
            />
          </label>

          <label className="advanced-filter-field">
            <span>Title contains</span>
            <input
              type="text"
              value={filters.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="Search title..."
            />
          </label>

          <label className="advanced-filter-field advanced-filter-field-wide">
            <span>Description contains</span>
            <input
              type="text"
              value={filters.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Search description..."
            />
          </label>

          <label className="advanced-filter-field">
            <span>Status</span>
            <select
              value={filters.statusSlug}
              onChange={(event) => update('statusSlug', event.target.value)}
            >
              <option value="">Any</option>
              {(options.statuses ?? []).map((status) => (
                <option key={status.id} value={status.slug}>
                  {status.name}
                </option>
              ))}
            </select>
          </label>

          <label className="advanced-filter-field">
            <span>Priority</span>
            <select
              value={filters.prioritySlug}
              onChange={(event) => update('prioritySlug', event.target.value)}
            >
              <option value="">Any</option>
              {options.priorities.map((priority) => (
                <option key={priority.id} value={priority.slug}>
                  {priority.name}
                </option>
              ))}
            </select>
          </label>

          <label className="advanced-filter-field">
            <span>Category</span>
            <select
              value={filters.categorySlug}
              onChange={(event) => update('categorySlug', event.target.value)}
            >
              <option value="">Any</option>
              {options.categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="advanced-filter-field">
            <span>Technician</span>
            <select
              value={filters.technicianId}
              onChange={(event) => update('technicianId', event.target.value)}
            >
              <option value="">Any</option>
              {options.technicians.map((tech) => (
                <option key={tech.id} value={String(tech.id)}>
                  {tech.fullName ?? `#${tech.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="advanced-filter-field">
            <span>Company</span>
            <select
              value={filters.companyId}
              onChange={(event) => update('companyId', event.target.value)}
            >
              <option value="">Any</option>
              {(options.companies ?? []).map((company) => (
                <option key={company.id} value={String(company.id)}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <label className="advanced-filter-field">
            <span>Created from</span>
            <input
              type="date"
              value={filters.createdFrom}
              onChange={(event) => update('createdFrom', event.target.value)}
            />
          </label>

          <label className="advanced-filter-field">
            <span>Created to</span>
            <input
              type="date"
              value={filters.createdTo}
              onChange={(event) => update('createdTo', event.target.value)}
            />
          </label>
        </div>
      )}
    </section>
  )
}
