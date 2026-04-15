import type { HttpContext } from '@adonisjs/core/http'
import Company from '#models/company'
import Ticket from '#models/ticket'
import User from '#models/user'

type CompanySummary = {
  id: number
  name: string
  code: string | null
  email: string | null
  phone: string | null
  branchCount: number
  clientCount: number
  createdAt: string
}

function serializeCompany(company: Company): CompanySummary {
  const branchCount = company.branches.length
  const clientCount = company.branches.reduce((total, branch) => total + branch.clients.length, 0)

  return {
    id: company.id,
    name: company.name,
    code: company.code,
    email: company.email,
    phone: company.phone,
    branchCount,
    clientCount,
    createdAt: company.createdAt.toISO() ?? company.createdAt.toSQL() ?? '',
  }
}

export default class CompaniesController {
  async index({ inertia, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const companies = await this.getScopedCompanies(user)

    if (user.isClient && companies.length === 0) {
      session.flash('error', 'No company is linked to your account.')
      return response.redirect().toRoute('dashboard')
    }

    return inertia.render('companies', {
      companies: companies.map(serializeCompany),
    })
  }

  async show({ inertia, auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const company = await this.findScopedCompany(user, Number(params.id))

    if (!company) {
      session.flash('error', 'Company not found.')
      return response.redirect().toPath('/companies')
    }

    const clientIds = company.branches.flatMap((branch) => branch.clients.map((client) => client.id))
    const recentTicketsQuery = Ticket.query()
      .where((query) => {
        query.where((nested) => nested.where('issuerType', 'company').where('issuerId', company.id))
        if (clientIds.length) {
          query.orWhere((nested) => nested.where('issuerType', 'user').whereIn('issuerId', clientIds))
        }
      })
      .preload('status')
      .preload('priority')
      .preload('creator', (query) => query.select('id', 'full_name', 'email'))
      .preload('technicians', (query) => query.select('id', 'full_name', 'email'))
      .orderBy('id', 'desc')
      .limit(12)

    const recentTickets = await recentTicketsQuery

    return inertia.render('companies/show', {
      company: {
        id: company.id,
        name: company.name,
        code: company.code,
        email: company.email,
        phone: company.phone,
        createdAt: company.createdAt.toISO() ?? company.createdAt.toSQL() ?? '',
        branchCount: company.branches.length,
        clientCount: clientIds.length,
        branches: company.branches.map((branch) => ({
          id: branch.id,
          name: branch.name,
          address: branch.address,
          city: branch.city,
          country: branch.country,
          clientCount: branch.clients.length,
          clients: branch.clients
            .slice()
            .sort((left, right) => (left.fullName ?? left.email).localeCompare(right.fullName ?? right.email))
            .map((client) => ({
              id: client.id,
              fullName: client.fullName,
              email: client.email,
            })),
        })),
        recentTickets: recentTickets.map((ticket) => ({
          id: ticket.id,
          title: ticket.title,
          createdAt: ticket.createdAt.toISO() ?? ticket.createdAt.toSQL() ?? '',
          status: ticket.status
            ? {
                slug: ticket.status.slug,
                name: ticket.status.name,
                color: ticket.status.color,
              }
            : null,
          priority: ticket.priority
            ? {
                name: ticket.priority.name,
                color: ticket.priority.color,
              }
            : null,
          createdBy: {
            id: ticket.creator?.id ?? null,
            fullName: ticket.creator?.fullName ?? null,
            email: ticket.creator?.email ?? null,
          },
          technicians: ticket.technicians.map((technician) => ({
            id: technician.id,
            fullName: technician.fullName,
            initials: technician.initials,
          })),
          issuerLabel:
            ticket.issuerType === 'company'
              ? company.name
              : company.branches
                  .flatMap((branch) => branch.clients)
                  .find((client) => client.id === ticket.issuerId)?.fullName ?? 'Client',
        })),
      },
    })
  }

  private async getScopedCompanies(user: User) {
    const query = Company.query()
      .preload('branches', (branchQuery) => {
        branchQuery.preload('clients', (clientQuery) => clientQuery.select('id'))
      })
      .orderBy('name', 'asc')

    if (user.isTechnician) {
      return query
    }

    const userWithBranch = await User.query()
      .where('id', user.id)
      .preload('branch', (branchQuery) => branchQuery.select('id', 'company_id'))
      .firstOrFail()

    const companyId = userWithBranch.branch?.companyId
    if (!companyId) {
      return []
    }

    return query.where('id', companyId)
  }

  private async findScopedCompany(user: User, companyId: number) {
    const companies = await Company.query()
      .where('id', companyId)
      .preload('branches', (branchQuery) => {
        branchQuery
          .orderBy('name', 'asc')
          .preload('clients', (clientQuery) =>
            clientQuery.select('id', 'full_name', 'email', 'branch_id').orderBy('full_name', 'asc')
          )
      })
      .first()

    if (!companies) {
      return null
    }

    if (user.isTechnician) {
      return companies
    }

    const scopedCompanies = await this.getScopedCompanies(user)
    return scopedCompanies.find((company) => company.id === companyId) ?? null
  }
}
