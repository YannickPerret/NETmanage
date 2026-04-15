import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Announcement from '#models/announcement'
import {
  createAnnouncementValidator,
  updateAnnouncementValidator,
} from '#validators/announcement'

function parseDateTime(value: string | null | undefined): DateTime | null {
  if (!value) return null
  const parsed = DateTime.fromISO(value)
  return parsed.isValid ? parsed : null
}

export default class AnnouncementsController {
  async index({ inertia, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) {
      session.flash('error', 'Only super-admin can manage announcements.')
      return response.redirect().toPath('/dashboard')
    }

    const announcements = await Announcement.query()
      .orderBy('position', 'asc')
      .orderBy('created_at', 'desc')

    return inertia.render('admin/announcements', {
      announcements: announcements.map((item) => item.serialize()),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) {
      session.flash('error', 'Only super-admin can create announcements.')
      return response.redirect().toPath('/dashboard')
    }

    const payload = await request.validateUsing(createAnnouncementValidator)
    const isActive = request.input('isActive') === 'true'

    await Announcement.create({
      title: payload.title,
      body: payload.body,
      variant: payload.variant,
      isActive,
      position: payload.position ?? 0,
      startsAt: parseDateTime(payload.startsAt),
      endsAt: parseDateTime(payload.endsAt),
      createdByUserId: user.id,
    })

    session.flash('success', 'Announcement created.')
    return response.redirect().toPath('/admin/announcements')
  }

  async update({ auth, params, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) {
      session.flash('error', 'Only super-admin can update announcements.')
      return response.redirect().toPath('/dashboard')
    }

    const announcement = await Announcement.findOrFail(Number(params.id))
    const payload = await request.validateUsing(updateAnnouncementValidator)
    const isActive = request.input('isActive') === 'true'

    announcement.merge({
      title: payload.title,
      body: payload.body,
      variant: payload.variant,
      isActive,
      position: payload.position ?? announcement.position,
      startsAt: parseDateTime(payload.startsAt),
      endsAt: parseDateTime(payload.endsAt),
    })

    await announcement.save()

    session.flash('success', 'Announcement updated.')
    return response.redirect().toPath('/admin/announcements')
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) {
      session.flash('error', 'Only super-admin can delete announcements.')
      return response.redirect().toPath('/dashboard')
    }

    const announcement = await Announcement.findOrFail(Number(params.id))
    await announcement.delete()

    session.flash('success', 'Announcement deleted.')
    return response.redirect().toPath('/admin/announcements')
  }
}

export async function getActiveAnnouncementsForDashboard() {
  const now = DateTime.now()
  const announcements = await Announcement.query()
    .where('is_active', true)
    .andWhere((query) => {
      query.whereNull('starts_at').orWhere('starts_at', '<=', now.toSQL()!)
    })
    .andWhere((query) => {
      query.whereNull('ends_at').orWhere('ends_at', '>=', now.toSQL()!)
    })
    .orderBy('position', 'asc')
    .orderBy('created_at', 'desc')

  return announcements.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    variant: item.variant,
  }))
}
