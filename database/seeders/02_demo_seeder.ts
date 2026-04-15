import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { CompanyFactory } from '#database/factories/company_factory'
import { UserFactory } from '#database/factories/user_factory'
import { TicketFactory } from '#database/factories/ticket_factory'
import { AttachmentFactory } from '#database/factories/attachment_factory'
import Status from '#models/status'
import Priority from '#models/priority'
import Category from '#models/category'
import Group from '#models/group'

export default class extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    const statuses = await Status.all()
    const priorities = await Priority.all()
    const categories = await Category.all()
    const groups = await Group.all()
    const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

    // 2 companies, each with 2 branches and 5 clients per branch
    const companies = await CompanyFactory.with('branches', 2, (branch) =>
      branch.with('clients', 5, (client) => client.apply('client'))
    ).createMany(2)

    // Technicians: 1 super-admin, 1 manager, 1 facturation, 3 techniciens
    const superAdmin = await UserFactory.apply('superAdmin').create()
    const manager = await UserFactory.apply('manager').create()
    const billing = await UserFactory.apply('facturation').create()
    const techs = await UserFactory.apply('technician').createMany(3)
    const allTechs = [superAdmin, manager, billing, ...techs]

    const clients = companies.flatMap((c) => c.branches.flatMap((b) => b.clients))

    // 30 tickets issued by random clients
    for (let i = 0; i < 30; i++) {
      const issuer = pick(clients)
      const ticket = await TicketFactory.merge({
        statusId: pick(statuses).id,
        priorityId: pick(priorities).id,
        categoryId: pick(categories).id,
        issuerType: 'user',
        issuerId: issuer.id,
        createdByUserId: issuer.id,
      }).create()

      const groupIds = [pick(groups).id]
      if (Math.random() > 0.5) groupIds.push(pick(groups).id)
      await ticket.related('groups').sync([...new Set(groupIds)])

      const assignees = new Set<number>()
      const count = 1 + Math.floor(Math.random() * 3)
      while (assignees.size < count) assignees.add(pick(techs).id)
      await ticket.related('technicians').sync([...assignees])

      const nAttachments = Math.floor(Math.random() * 3)
      if (nAttachments > 0) {
        await AttachmentFactory.merge({
          attachableType: 'ticket',
          attachableId: ticket.id,
          uploadedByUserId: issuer.id,
        }).createMany(nAttachments)
      }
    }

    // A few company-level tickets, created by a manager
    for (const company of companies) {
      await TicketFactory.merge({
        statusId: pick(statuses).id,
        priorityId: pick(priorities).id,
        categoryId: pick(categories).id,
        issuerType: 'company',
        issuerId: company.id,
        createdByUserId: manager.id,
      }).create()
    }

    // Keep reference to avoid unused warnings
    void allTechs
  }
}
