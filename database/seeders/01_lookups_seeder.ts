import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Status from '#models/status'
import Priority from '#models/priority'
import Category from '#models/category'
import Group from '#models/group'

export default class extends BaseSeeder {
  async run() {
    await Status.updateOrCreateMany('slug', [
      { slug: 'open', name: 'Open', color: '#3b82f6', position: 1 },
      { slug: 'in_progress', name: 'In Progress', color: '#f59e0b', position: 2 },
      { slug: 'pending', name: 'Pending', color: '#a855f7', position: 3 },
      { slug: 'resolved', name: 'Resolved', color: '#10b981', position: 4 },
      { slug: 'closed', name: 'Closed', color: '#6b7280', position: 5 },
    ])

    await Priority.updateOrCreateMany('slug', [
      { slug: 'low', name: 'Low', level: 1, color: '#10b981' },
      { slug: 'medium', name: 'Medium', level: 2, color: '#f59e0b' },
      { slug: 'high', name: 'High', level: 3, color: '#ef4444' },
      { slug: 'critical', name: 'Critical', level: 4, color: '#991b1b' },
    ])

    await Category.updateOrCreateMany('slug', [
      { slug: 'incident', name: 'Incident' },
      { slug: 'request', name: 'Request' },
      { slug: 'question', name: 'Question' },
      { slug: 'bug', name: 'Bug' },
    ])

    await Group.updateOrCreateMany('slug', [
      { slug: 'technique', name: 'Technique' },
      { slug: 'support', name: 'Support' },
      { slug: 'web', name: 'Web' },
      { slug: 'securite', name: 'Sécurité' },
    ])
  }
}
