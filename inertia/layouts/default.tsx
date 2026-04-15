import { Data } from '@generated/data'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { ReactElement, useEffect, useState } from 'react'
import { Form, Link } from '@adonisjs/inertia/react'
import CreateTicketModal, {
  TicketFormOptions,
} from '../components/create_ticket_modal'

type PageProps = Data.SharedProps & {
  options?: TicketFormOptions
}

export default function Layout({ children }: { children: ReactElement<PageProps> }) {
  const [modalOpen, setModalOpen] = useState(false)
  const page = usePage<PageProps>()

  useEffect(() => {
    toast.dismiss()
  }, [page.url])

  useEffect(() => {
    if (children.props.flash.error) {
      toast.error(children.props.flash.error)
    }
    if (children.props.flash.success) {
      toast.success(children.props.flash.success)
    }
  })

  const isAuthed = !!children.props.user
  const options = (page.props as PageProps).options

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-left">
            <Link route="home" className="app-logo">
              <svg
                width="96"
                height="20"
                viewBox="0 0 195 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M180 37.5v-30h-7.5V0H195v7.5h-7.5v30H180ZM150 15V7.5h-15V0h15v7.5h7.5V15H150Zm-15 22.5V30h-7.5V7.5h7.5V30h15v7.5h-15Zm15-7.5v-7.5h7.5V30H150ZM82.5 37.5v-30H90V0h15v7.5h7.5v30H105v-15H90v15h-7.5ZM90 15h15V7.8H90V15ZM45 37.5V0h22.5v7.5h-15V15h15v7.5h-15V30h15v7.5H45ZM0 37.5V0h22.5v7.5H30V15h-7.5v15H30v7.5h-7.5V30H15v-7.5H7.5v15H0ZM7.5 15h14.7V7.5H7.5V15Z"
                  fill="currentColor"
                />
              </svg>
            </Link>

            {isAuthed && (
              <nav className="app-nav">
                <Link route="dashboard" className="app-nav-link">
                  Dashboard
                </Link>
              </nav>
            )}

            {isAuthed && options && (
              <button
                type="button"
                className="new-ticket-btn"
                onClick={() => setModalOpen(true)}
                title="New ticket"
                aria-label="Create a new ticket"
              >
                <span className="plus">+</span>
                <span className="label">New ticket</span>
              </button>
            )}
          </div>
          <div className="app-header-right">
            <nav>
              {isAuthed ? (
                <>
                  <span className="user-initials">{children.props.user!.initials}</span>
                  <Form route="session.destroy">
                    <button type="submit" className="btn btn-ghost">
                      Logout
                    </button>
                  </Form>
                </>
              ) : (
                <>
                  <Link route="new_account.create">Signup</Link>
                  <Link route="session.create">Login</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <Toaster position="top-center" richColors />

      {options && (
        <CreateTicketModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          options={options}
        />
      )}
    </>
  )
}
