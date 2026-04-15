import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'
import transmit from '@adonisjs/transmit/services/main'
import {
  AWAITING_TICKETS_CHANNEL,
  TECHNICIAN_TICKETS_INDEX_CHANNEL,
  USER_TICKETS_INDEX_CHANNEL_PATTERN,
} from '#services/ticket_realtime'

transmit.authorize(AWAITING_TICKETS_CHANNEL, (ctx: HttpContext) => {
  return ctx.auth.user?.isTechnician === true
})

transmit.authorize(TECHNICIAN_TICKETS_INDEX_CHANNEL, (ctx: HttpContext) => {
  return ctx.auth.user?.isTechnician === true
})

transmit.authorize<{ id: string }>(USER_TICKETS_INDEX_CHANNEL_PATTERN, (ctx, { id }) => {
  return ctx.auth.user?.id === Number(id)
})

transmit.authorize<{ id: string }>('tickets/:id', async (ctx: HttpContext, { id }) => {
  const user = ctx.auth.user

  if (!user) {
    return false
  }

  const ticket = await Ticket.query()
    .where('id', Number(id))
    .where((query) => {
      query.where((issuerQuery) => {
        issuerQuery.where('issuerType', 'user').where('issuerId', user.id)
      })

      if (user.isTechnician) {
        query.orWhereHas('technicians', (techniciansQuery) => {
          techniciansQuery.where('users.id', user.id)
        })
      }
    })
    .first()

  return !!ticket
})

transmit.authorize<{ id: string }>('technicians/:id/tickets', (ctx: HttpContext, { id }) => {
  return ctx.auth.user?.isTechnician === true && ctx.auth.user.id === Number(id)
})
