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

router.on('/').renderInertia('home', {}).as('home')

router.get('tickets/:id/close/confirm', [controllers.Tickets, 'confirmClosePage'])
router.post('tickets/:id/close/confirm', [controllers.Tickets, 'confirmClose'])
router.get('tickets/:id/satisfaction', [controllers.Tickets, 'satisfactionPage'])
router.post('tickets/:id/satisfaction', [controllers.Tickets, 'submitSatisfaction'])

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
    router.post('tickets', [controllers.Tickets, 'store']).as('tickets.store')
    router.post('tickets/:id/open', [controllers.Tickets, 'open']).as('tickets.open')
    router.post('tickets/:id/resolve', [controllers.Tickets, 'resolve']).as('tickets.resolve')
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
