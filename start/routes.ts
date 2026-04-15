/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

const MailServicesController = () => import('#controllers/mail_services_controller')
const CompaniesController = () => import('#controllers/companies_controller')
const AnnouncementsController = () => import('#controllers/announcements_controller')

router.on('/').renderInertia('home', {}).as('home')

router.get('tickets/:id/close/confirm', [controllers.Tickets, 'confirmClosePage'])
router.post('tickets/:id/close/confirm', [controllers.Tickets, 'confirmClose'])
router.get('tickets/:id/satisfaction', [controllers.Tickets, 'satisfactionPage'])
router.post('tickets/:id/satisfaction', [controllers.Tickets, 'submitSatisfaction'])
router.post('webhooks/m365/notifications', [MailServicesController, 'webhook'])

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.get('dashboard', [controllers.Tickets, 'index']).as('dashboard')
    router.get('satisfactions', [controllers.Tickets, 'satisfactions']).as('satisfactions.index')
    router.get('tickets', [controllers.Tickets, 'list']).as('tickets.index')
    router.get('tickets/:id', [controllers.Tickets, 'show']).as('tickets.show')
    router.get('companies', [CompaniesController, 'index'])
    router.get('companies/:id', [CompaniesController, 'show'])
    router.post('tickets', [controllers.Tickets, 'store']).as('tickets.store')
    router.post('tickets/:id/open', [controllers.Tickets, 'open']).as('tickets.open')
    router.post('tickets/:id/parent', [controllers.Tickets, 'setParent'])
    router.post('tickets/:id/parent/remove', [controllers.Tickets, 'removeParent'])
    router.post('tickets/:id/resolve', [controllers.Tickets, 'resolve']).as('tickets.resolve')
    router.get('admin/serviceMail', [MailServicesController, 'index'])
    router.post('admin/serviceMail/m365/connect', [MailServicesController, 'startOauth'])
    router.get('admin/serviceMail/m365/callback', [MailServicesController, 'oauthCallback'])
    router.post('admin/serviceMail/accounts/:id/folders', [MailServicesController, 'updateFolders'])
    router.post('admin/serviceMail/accounts/:id/folders/refresh', [MailServicesController, 'refreshFolders'])
    router.post('admin/serviceMail/accounts/:id/sync', [MailServicesController, 'syncNow'])
    router.get('admin/announcements', [AnnouncementsController, 'index'])
    router.post('admin/announcements', [AnnouncementsController, 'store'])
    router.post('admin/announcements/:id', [AnnouncementsController, 'update'])
    router.post('admin/announcements/:id/delete', [AnnouncementsController, 'destroy'])
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
