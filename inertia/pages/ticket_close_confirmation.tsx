import { router } from '@inertiajs/react'

export default function TicketCloseConfirmationPage({
  ticketId,
  title,
  valid,
  confirmed,
}: {
  ticketId: number
  title: string | null
  valid: boolean
  confirmed: boolean
}) {
  if (!valid) {
    return (
      <div className="dashboard">
        <section className="dashboard-section">
          <h2>Link invalid</h2>
          <p className="muted">This confirmation link is invalid or has already been used.</p>
        </section>
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="dashboard">
        <section className="dashboard-section">
          <h2>Ticket closed</h2>
          <p className="muted">
            Ticket #{ticketId} {title ? `(${title})` : ''} has been closed. A satisfaction email has
            been sent to you.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <h2>Confirm closure</h2>
        <p className="muted">
          Confirm that ticket #{ticketId} {title ? `(${title})` : ''} is resolved and can be closed.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => router.post(window.location.pathname + window.location.search)}
        >
          Confirm closure
        </button>
      </section>
    </div>
  )
}
