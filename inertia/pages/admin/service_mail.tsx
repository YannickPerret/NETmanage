import { Form } from '@adonisjs/inertia/react'
import { DateTime } from 'luxon'

type MailServiceFolder = {
  id: number
  graphFolderId: string
  displayName: string
  wellKnownName: string | null
  isEnabled: boolean
  lastError: string | null
  lastSyncedAt: string | null
  subscriptionExpiresAt: string | null
}

type MailServiceAccount = {
  id: number
  email: string
  displayName: string | null
  lastError: string | null
  lastSyncedAt: string | null
  tokenExpiresAt: string | null
  folders: MailServiceFolder[]
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Never'
  }

  const date = DateTime.fromISO(value)
  return date.isValid ? date.toFormat('dd LLL yyyy HH:mm') : value
}

export default function ServiceMailAdmin({
  accounts,
  m365,
}: {
  accounts: MailServiceAccount[]
  m365: {
    configured: boolean
    redirectUrl: string
    webhookUrl: string
  }
}) {
  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="service-mail-header">
          <div>
            <h1>Mail services</h1>
            <p className="service-mail-copy">
              Connect a Microsoft 365 mailbox, choose the folders to sync, then incoming emails
              are converted into tickets automatically.
            </p>
          </div>

          <Form action="/admin/serviceMail/m365/connect" method="post">
            <button type="submit" className="btn btn-primary" disabled={!m365.configured}>
              Connect Microsoft 365 mailbox
            </button>
          </Form>
        </div>

        <div className="service-mail-meta">
          <div>
            <strong>OAuth redirect</strong>
            <span>{m365.redirectUrl}</span>
          </div>
          <div>
            <strong>Webhook endpoint</strong>
            <span>{m365.webhookUrl}</span>
          </div>
          {!m365.configured && (
            <div className="service-mail-warning">
              Microsoft 365 env variables are missing. Add tenant, client id, client secret and a
              public webhook URL before connecting a mailbox.
            </div>
          )}
        </div>
      </section>

      {accounts.map((account) => {
        const enabledCount = account.folders.filter((folder) => folder.isEnabled).length

        return (
          <section className="dashboard-section service-mail-card" key={account.id}>
            <div className="service-mail-account-head">
              <div>
                <h2>{account.displayName || account.email}</h2>
                <p className="ticket-meta">
                  {account.email} · {enabledCount} synced folder{enabledCount > 1 ? 's' : ''}
                </p>
              </div>

              <div className="service-mail-actions">
                <Form action={`/admin/serviceMail/accounts/${account.id}/folders/refresh`} method="post">
                  <button type="submit" className="btn btn-ghost">
                    Refresh folders
                  </button>
                </Form>
                <Form action={`/admin/serviceMail/accounts/${account.id}/sync`} method="post">
                  <button type="submit" className="btn btn-primary">
                    Sync now
                  </button>
                </Form>
              </div>
            </div>

            <div className="service-mail-stats">
              <span>Last sync: {formatDate(account.lastSyncedAt)}</span>
              <span>Token expiry: {formatDate(account.tokenExpiresAt)}</span>
            </div>

            {account.lastError && <div className="service-mail-error">{account.lastError}</div>}

            <Form action={`/admin/serviceMail/accounts/${account.id}/folders`} method="post">
              <div className="service-mail-folder-grid">
                {account.folders.map((folder) => (
                  <label key={folder.id} className={`service-mail-folder ${folder.isEnabled ? 'is-enabled' : ''}`}>
                    <input
                      type="checkbox"
                      name="folderIds[]"
                      value={folder.graphFolderId}
                      defaultChecked={folder.isEnabled}
                    />
                    <span className="service-mail-folder-name">{folder.displayName}</span>
                    <span className="service-mail-folder-meta">
                      {folder.wellKnownName || 'custom'} · last sync {formatDate(folder.lastSyncedAt)}
                    </span>
                    <span className="service-mail-folder-meta">
                      Subscription {formatDate(folder.subscriptionExpiresAt)}
                    </span>
                    {folder.lastError && (
                      <span className="service-mail-folder-error">{folder.lastError}</span>
                    )}
                  </label>
                ))}
              </div>

              <div className="service-mail-submit">
                <button type="submit" className="btn btn-primary">
                  Save synced folders
                </button>
              </div>
            </Form>
          </section>
        )
      })}

      {accounts.length === 0 && (
        <section className="dashboard-section">
          <p className="service-mail-copy">
            No Microsoft 365 mailbox is connected yet. Start with one mailbox, sync the folders you
            want to watch, and incoming mails will enter the awaiting-assignment queue.
          </p>
        </section>
      )}
    </div>
  )
}
