import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Data } from '@generated/data'

export default function TicketSatisfactionPage({
  ticketId,
  title,
  token,
  valid,
  submitted,
}: {
  ticketId: number
  title: string | null
  token: string | null
  valid: boolean
  submitted: boolean
}) {
  const page = usePage<Data.SharedProps>()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  if (!valid) {
    return (
      <div className="dashboard">
        <section className="dashboard-section">
          <h2>Link invalid</h2>
          <p className="muted">This satisfaction link is invalid or has already been used.</p>
        </section>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="dashboard">
        <section className="dashboard-section">
          <h2>Thank you</h2>
          <p className="muted">Your satisfaction for ticket #{ticketId} has been recorded.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <h2>Customer satisfaction</h2>
        <p className="muted">
          Share your feedback for ticket #{ticketId} {title ? `(${title})` : ''}.
        </p>

        <div className="field" style={{ maxWidth: 420 }}>
          <label htmlFor="rating">Rating</label>
          <select
            id="rating"
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
          >
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Average</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Very poor</option>
          </select>
          {page.props.errors.rating && <span className="field-error">{page.props.errors.rating}</span>}
        </div>

        <div className="field" style={{ maxWidth: 640 }}>
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            rows={5}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Optional details"
          />
          {page.props.errors.comment && <span className="field-error">{page.props.errors.comment}</span>}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            router.post(window.location.pathname, {
              token,
              rating,
              comment,
            })
          }
        >
          Submit feedback
        </button>
      </section>
    </div>
  )
}
