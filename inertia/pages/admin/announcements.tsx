import { Form } from '@adonisjs/inertia/react'
import { DateTime } from 'luxon'
import { useState } from 'react'

type Announcement = {
  id: number
  title: string
  body: string
  variant: 'info' | 'success' | 'warning' | 'danger'
  isActive: boolean
  position: number
  startsAt: string | null
  endsAt: string | null
  createdAt: string
  updatedAt: string | null
}

const VARIANTS: Array<Announcement['variant']> = ['info', 'success', 'warning', 'danger']

function toDateTimeLocal(value: string | null) {
  if (!value) return ''
  const date = DateTime.fromISO(value)
  return date.isValid ? date.toFormat("yyyy-LL-dd'T'HH:mm") : ''
}

export default function AnnouncementsAdmin({
  announcements,
}: {
  announcements: Announcement[]
}) {
  const [editing, setEditing] = useState<number | null>(null)

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="service-mail-header">
          <div>
            <h1>Announcements</h1>
            <p className="service-mail-copy">
              Publish notices that appear in the dashboard carousel for every user.
            </p>
          </div>
        </div>

        <Form action="/admin/announcements" method="post" resetOnSuccess>
          <div className="announcement-form-grid">
            <label className="announcement-field">
              <span>Title</span>
              <input type="text" name="title" required maxLength={191} />
            </label>
            <label className="announcement-field announcement-field-wide">
              <span>Body</span>
              <textarea name="body" required maxLength={2000} rows={3} />
            </label>
            <label className="announcement-field">
              <span>Variant</span>
              <select name="variant" defaultValue="info">
                {VARIANTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="announcement-field">
              <span>Position</span>
              <input type="number" name="position" defaultValue={0} min={0} />
            </label>
            <label className="announcement-field">
              <span>Starts at</span>
              <input type="datetime-local" name="startsAt" />
            </label>
            <label className="announcement-field">
              <span>Ends at</span>
              <input type="datetime-local" name="endsAt" />
            </label>
            <label className="announcement-field announcement-field-inline">
              <input type="checkbox" name="isActive" value="true" defaultChecked />
              <span>Active</span>
            </label>
          </div>
          <div className="service-mail-submit">
            <button type="submit" className="btn btn-primary">
              Publish announcement
            </button>
          </div>
        </Form>
      </section>

      <section className="dashboard-section">
        <h2>Published announcements</h2>

        {announcements.length === 0 ? (
          <p className="service-mail-copy">No announcement yet.</p>
        ) : (
          <div className="announcement-list">
            {announcements.map((item) => {
              const isEditing = editing === item.id
              return (
                <article key={item.id} className={`announcement-row is-${item.variant}`}>
                  {isEditing ? (
                    <Form
                      action={`/admin/announcements/${item.id}`}
                      method="post"
                      onSuccess={() => setEditing(null)}
                    >
                      <div className="announcement-form-grid">
                        <label className="announcement-field">
                          <span>Title</span>
                          <input type="text" name="title" defaultValue={item.title} required />
                        </label>
                        <label className="announcement-field announcement-field-wide">
                          <span>Body</span>
                          <textarea name="body" defaultValue={item.body} rows={3} required />
                        </label>
                        <label className="announcement-field">
                          <span>Variant</span>
                          <select name="variant" defaultValue={item.variant}>
                            {VARIANTS.map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="announcement-field">
                          <span>Position</span>
                          <input type="number" name="position" defaultValue={item.position} min={0} />
                        </label>
                        <label className="announcement-field">
                          <span>Starts at</span>
                          <input
                            type="datetime-local"
                            name="startsAt"
                            defaultValue={toDateTimeLocal(item.startsAt)}
                          />
                        </label>
                        <label className="announcement-field">
                          <span>Ends at</span>
                          <input
                            type="datetime-local"
                            name="endsAt"
                            defaultValue={toDateTimeLocal(item.endsAt)}
                          />
                        </label>
                        <label className="announcement-field announcement-field-inline">
                          <input
                            type="checkbox"
                            name="isActive"
                            value="true"
                            defaultChecked={item.isActive}
                          />
                          <span>Active</span>
                        </label>
                      </div>
                      <div className="announcement-actions">
                        <button type="submit" className="btn btn-primary">
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </Form>
                  ) : (
                    <>
                      <div className="announcement-row-body">
                        <div className="announcement-row-head">
                          <span className={`glacier-announcement-variant is-${item.variant}`}>
                            {item.variant}
                          </span>
                          <span className="announcement-row-meta">
                            {item.isActive ? 'Active' : 'Inactive'} · position {item.position}
                          </span>
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.body}</p>
                        {(item.startsAt || item.endsAt) && (
                          <p className="announcement-row-meta">
                            {item.startsAt ? `From ${DateTime.fromISO(item.startsAt).toFormat('dd LLL HH:mm')}` : 'Always on'}
                            {' · '}
                            {item.endsAt ? `until ${DateTime.fromISO(item.endsAt).toFormat('dd LLL HH:mm')}` : 'no end'}
                          </p>
                        )}
                      </div>
                      <div className="announcement-actions">
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setEditing(item.id)}
                        >
                          Edit
                        </button>
                        <Form action={`/admin/announcements/${item.id}/delete`} method="post">
                          <button type="submit" className="btn btn-ghost">
                            Delete
                          </button>
                        </Form>
                      </div>
                    </>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
