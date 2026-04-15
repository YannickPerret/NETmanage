import { useMemo, useState } from 'react'
import { DateTime } from 'luxon'

type SatisfactionRow = {
  id: number
  rating: number
  comment: string | null
  createdAt: string
  ticket: {
    id: number
    title: string
  }
  submittedBy: {
    id: number
    fullName: string | null
    email: string
  }
}

function formatDate(value: string) {
  return DateTime.fromISO(value).toFormat('dd LLL yyyy, HH:mm')
}

function ratingLabel(rating: number) {
  return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`
}

function isInPeriod(value: string, period: 'all' | '7d' | '30d' | '90d') {
  if (period === 'all') {
    return true
  }

  const date = DateTime.fromISO(value)
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90

  return date >= DateTime.now().minus({ days })
}

export default function SatisfactionsPage({
  averageRating,
  satisfactions,
}: {
  averageRating: number | null
  satisfactions: SatisfactionRow[]
}) {
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')
  const [periodFilter, setPeriodFilter] = useState<'all' | '7d' | '30d' | '90d'>('all')

  const filteredSatisfactions = useMemo(() => {
    return satisfactions.filter((satisfaction) => {
      const matchesRating =
        ratingFilter === 'all' ? true : satisfaction.rating === Number(ratingFilter)
      const matchesPeriod = isInPeriod(satisfaction.createdAt, periodFilter)

      return matchesRating && matchesPeriod
    })
  }, [periodFilter, ratingFilter, satisfactions])

  const filteredAverage =
    filteredSatisfactions.length === 0
      ? null
      : Number(
          (
            filteredSatisfactions.reduce((total, satisfaction) => total + satisfaction.rating, 0) /
            filteredSatisfactions.length
          ).toFixed(1)
        )

  const fiveStarRate =
    filteredSatisfactions.length === 0
      ? null
      : Math.round(
          (filteredSatisfactions.filter((satisfaction) => satisfaction.rating === 5).length /
            filteredSatisfactions.length) *
            100
        )

  const latestResponse = filteredSatisfactions[0]?.createdAt ?? null

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Satisfaction</h2>
          <span className="section-count">{filteredSatisfactions.length}</span>
        </div>

        <div className="satisfaction-summary">
          <div className="satisfaction-stat">
            <span className="satisfaction-stat-label">Overall average</span>
            <strong className="satisfaction-stat-value">
              {averageRating === null ? '—' : `${averageRating}/5`}
            </strong>
          </div>
          <div className="satisfaction-stat">
            <span className="satisfaction-stat-label">Filtered average</span>
            <strong className="satisfaction-stat-value">
              {filteredAverage === null ? '—' : `${filteredAverage}/5`}
            </strong>
          </div>
          <div className="satisfaction-stat">
            <span className="satisfaction-stat-label">Responses</span>
            <strong className="satisfaction-stat-value">{filteredSatisfactions.length}</strong>
          </div>
          <div className="satisfaction-stat">
            <span className="satisfaction-stat-label">5-star rate</span>
            <strong className="satisfaction-stat-value">
              {fiveStarRate === null ? '—' : `${fiveStarRate}%`}
            </strong>
          </div>
        </div>

        <div className="satisfaction-filters">
          <div className="field satisfaction-filter-field">
            <label htmlFor="rating-filter">Rating</label>
            <select
              id="rating-filter"
              value={ratingFilter}
              onChange={(event) =>
                setRatingFilter(event.target.value as 'all' | '5' | '4' | '3' | '2' | '1')
              }
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>

          <div className="field satisfaction-filter-field">
            <label htmlFor="period-filter">Period</label>
            <select
              id="period-filter"
              value={periodFilter}
              onChange={(event) =>
                setPeriodFilter(event.target.value as 'all' | '7d' | '30d' | '90d')
              }
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {latestResponse && (
          <p className="muted satisfaction-latest">
            Latest response: {formatDate(latestResponse)}
          </p>
        )}

        {filteredSatisfactions.length === 0 ? (
          <p className="muted" style={{ padding: '16px 4px' }}>
            No client satisfaction matches the current filters.
          </p>
        ) : (
          <div className="satisfaction-list">
            {filteredSatisfactions.map((satisfaction) => (
              <article key={satisfaction.id} className="satisfaction-card">
                <div className="satisfaction-card-header">
                  <div>
                    <h3>Ticket #{satisfaction.ticket.id}</h3>
                    <p className="muted">{satisfaction.ticket.title}</p>
                  </div>
                  <div className="satisfaction-rating" title={`${satisfaction.rating}/5`}>
                    {ratingLabel(satisfaction.rating)}
                  </div>
                </div>

                <div className="satisfaction-meta">
                  <span>
                    By {satisfaction.submittedBy.fullName ?? satisfaction.submittedBy.email}
                  </span>
                  <span>{formatDate(satisfaction.createdAt)}</span>
                  <a href={`/tickets#ticket-${satisfaction.ticket.id}`} className="satisfaction-ticket-link">
                    View ticket
                  </a>
                </div>

                <p className="satisfaction-comment">
                  {satisfaction.comment?.trim() || 'No comment provided.'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
