import { Data } from '@generated/data'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { Form, Link } from '@adonisjs/inertia/react'
import CreateTicketModal, {
  TicketFormOptions,
} from '../components/create_ticket_modal'

type PageProps = Data.SharedProps & {
  options?: TicketFormOptions
}

type NavItem = {
  href: string
  label: string
  match: (url: string) => boolean
  icon: 'dashboard' | 'tickets' | 'companies' | 'service' | 'satisfaction' | 'announce'
}

const authNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    match: (url) => url.startsWith('/dashboard'),
    icon: 'dashboard',
  },
  {
    href: '/tickets',
    label: 'All tickets',
    match: (url) => url.startsWith('/tickets'),
    icon: 'tickets',
  },
  {
    href: '/companies',
    label: 'Companies',
    match: (url) => url.startsWith('/companies'),
    icon: 'companies',
  },
  {
    href: '/admin/serviceMail',
    label: 'Mail services',
    match: (url) => url.startsWith('/admin/serviceMail'),
    icon: 'service',
  },
  {
    href: '/admin/announcements',
    label: 'Announcements',
    match: (url) => url.startsWith('/admin/announcements'),
    icon: 'announce',
  },
  {
    href: '/satisfactions',
    label: 'Satisfaction',
    match: (url) => url.startsWith('/satisfactions'),
    icon: 'satisfaction',
  },
]

function getPageTitle(url: string) {
  if (url.startsWith('/tickets/')) return 'Ticket detail'
  if (url.startsWith('/tickets')) return 'All tickets'
  if (url.startsWith('/companies/')) return 'Company detail'
  if (url.startsWith('/companies')) return 'Companies'
  if (url.startsWith('/admin/serviceMail')) return 'Mail services'
  if (url.startsWith('/admin/announcements')) return 'Announcements'
  if (url.startsWith('/satisfactions')) return 'Satisfaction'
  if (url.startsWith('/dashboard')) return ''
  return 'NetManage'
}

function ShellIcon({ icon }: { icon: NavItem['icon'] | 'search' | 'bell' | 'settings' | 'support' | 'logout' | 'plus' }) {
  switch (icon) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h7v7H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 13h7v7H4z" />
        </svg>
      )
    case 'tickets':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 6h14a2 2 0 0 1 2 2v3a2.5 2.5 0 0 0 0 5v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2.5 2.5 0 0 0 0-5V8a2 2 0 0 1 2-2zm4 3v6m3-6v6" />
        </svg>
      )
    case 'companies':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20V8l8-4 8 4v12H4zm4-2h2v-2H8v2zm0-4h2v-2H8v2zm0-4h2V8H8v2zm6 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V8h-2v2z" />
        </svg>
      )
    case 'service':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16v10H4zM7 10h3m2 0h5m-8 4h8M6 5h12M6 19h12" />
        </svg>
      )
    case 'satisfaction':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 17.3-5.3 3 1-6.1L3.5 10l6.2-.9L12 3.5l2.3 5.6 6.2.9-4.2 4.2 1 6.1z" />
        </svg>
      )
    case 'announce':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10v4l10 5V5L4 10zm14 0a3 3 0 0 1 0 4M6 14v4h2l1 2h2v-4" />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm8 14-4.2-4.2" />
        </svg>
      )
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4a4 4 0 0 1 4 4v2.4c0 .8.3 1.6.8 2.2l1.2 1.4V16H6v-2l1.2-1.4c.5-.6.8-1.4.8-2.2V8a4 4 0 0 1 4-4zm0 16a2.5 2.5 0 0 0 2.3-1.5H9.7A2.5 2.5 0 0 0 12 20z" />
        </svg>
      )
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5zm8 3.5-1.8-.7a6.8 6.8 0 0 0-.6-1.5l.8-1.8-1.8-1.8-1.8.8a6.8 6.8 0 0 0-1.5-.6L12 4l-1.3 1.7a6.8 6.8 0 0 0-1.5.6l-1.8-.8-1.8 1.8.8 1.8a6.8 6.8 0 0 0-.6 1.5L4 12l1.8.7c.1.5.3 1 .6 1.5l-.8 1.8 1.8 1.8 1.8-.8c.5.3 1 .5 1.5.6L12 20l1.3-1.7c.5-.1 1-.3 1.5-.6l1.8.8 1.8-1.8-.8-1.8c.3-.5.5-1 .6-1.5L20 12z" />
        </svg>
      )
    case 'support':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20a8 8 0 1 0-8-8v3a2 2 0 0 0 2 2h2v-6H6a6 6 0 1 1 12 0h-2v6h1a2 2 0 0 0 2-2v-3a8 8 0 0 0-8-8zm-1 0h2" />
        </svg>
      )
    case 'logout':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 17 15 12 10 7M15 12H4M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
        </svg>
      )
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    default:
      return null
  }
}

export default function Layout({ children }: { children: ReactElement<PageProps> }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    setUserMenuOpen(false)
  }, [page.url])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const isAuthed = !!children.props.user
  const options = (page.props as PageProps).options
  const pageTitle = getPageTitle(page.url)
  const navItems = authNavItems.filter((item) => {
    if (item.href === '/admin/serviceMail') return children.props.user?.role === 'super-admin'
    if (item.href === '/admin/announcements') return children.props.user?.role === 'super-admin'
    if (item.href === '/satisfactions') return children.props.user?.type === 'technician'
    return true
  })

  if (!isAuthed) {
    return (
      <>
        <div className="guest-shell">
          <header className="guest-header">
            <Link route="home" className="guest-logo">
              NetManage
            </Link>
            <nav className="guest-nav">
              <Link route="new_account.create">Signup</Link>
              <Link route="session.create">Login</Link>
            </nav>
          </header>
          <main className="guest-main">{children}</main>
        </div>
        <Toaster position="top-center" richColors />
      </>
    )
  }

  return (
    <>
      <div className="app-shell">
        <aside className="app-sidebar">
          <div className="app-brand">
            <div className="app-brand-mark">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3 6 9v8h12V9l-6-6zm0 4.2L14.8 10H9.2L12 7.2zM9 13h6v2H9z" />
              </svg>
            </div>
            <div>
              <h1>Glacier Enterprise</h1>
            </div>
          </div>

          <nav className="shell-nav">
            {navItems.map((item) => {
              const active = item.match(page.url)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shell-nav-link ${active ? 'is-active' : ''}`}
                >
                  <span className="shell-nav-icon">
                    <ShellIcon icon={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="shell-sidebar-footer">
            <Form route="session.destroy">
              <button type="submit" className="shell-nav-link shell-nav-link-muted shell-nav-form-button">
                <span className="shell-nav-icon">
                  <ShellIcon icon="logout" />
                </span>
                <span>Logout</span>
              </button>
            </Form>
          </div>
        </aside>

        <div className="app-shell-main">
          <header className="app-topbar">
            <div className="app-topbar-heading">
              <h2>{pageTitle}</h2>
              <label className="app-search">
                <span className="app-search-icon">
                  <ShellIcon icon="search" />
                </span>
                <input type="text" placeholder="Search across Glacier..." />
              </label>
            </div>

            <div className="app-topbar-actions">
              <button type="button" className="topbar-icon-button">
                <ShellIcon icon="bell" />
                <span className="topbar-icon-dot" />
              </button>
              <button type="button" className="topbar-icon-button">
                <ShellIcon icon="settings" />
              </button>

              <div className="user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-initials user-menu-trigger"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((open) => !open)}
                >
                  {children.props.user!.initials}
                </button>

                {userMenuOpen && (
                  <div className="user-menu-popover" role="menu">
                    {children.props.user?.type === 'technician' && (
                      <Link route="satisfactions.index" className="user-menu-link" role="menuitem">
                        Satisfaction
                      </Link>
                    )}
                    <Link href="/companies" className="user-menu-link" role="menuitem">
                      Companies
                    </Link>
                    <Form route="session.destroy">
                      <button type="submit" className="user-menu-link user-menu-button" role="menuitem">
                        Logout
                      </button>
                    </Form>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="app-content">{children}</main>
        </div>

        {options && (
          <button
            type="button"
            className="app-fab"
            onClick={() => setModalOpen(true)}
            title="New ticket"
            aria-label="Create a new ticket"
          >
            <ShellIcon icon="plus" />
          </button>
        )}
      </div>

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
