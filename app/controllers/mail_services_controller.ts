import type { HttpContext } from '@adonisjs/core/http'
import {
  connectM365Mailbox,
  findMailServiceAccountOrFail,
  getMailServiceAdminSnapshot,
  getM365ConnectUrl,
  handleGraphNotificationPayload,
  listMailServiceAccounts,
  syncEnabledMailbox,
  syncMailboxFolders,
  updateEnabledFolders,
} from '#services/mail_service_ingestion'
import { getM365RedirectUrl, getM365WebhookUrl, isM365Configured } from '#services/m365_graph'
import { updateMailServiceFoldersValidator } from '#validators/mail_service'
import { randomBytes } from 'node:crypto'

export default class MailServicesController {
  async index({ inertia, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) {
      session.flash('error', 'Only super-admin can access mail services.')
      return response.redirect().toPath('/dashboard')
    }

    const accounts = await listMailServiceAccounts()

    return inertia.render('admin/service_mail', {
      accounts: accounts.map(getMailServiceAdminSnapshot),
      m365: {
        configured: isM365Configured(),
        redirectUrl: getM365RedirectUrl(),
        webhookUrl: getM365WebhookUrl(),
      },
    })
  }

  async startOauth({ auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) {
      session.flash('error', 'Only super-admin can connect Microsoft 365 mailboxes.')
      return response.redirect().toPath('/dashboard')
    }

    if (!isM365Configured()) {
      session.flash('error', 'Microsoft 365 OAuth is not configured yet.')
      return response.redirect().toPath('/admin/serviceMail')
    }

    const state = randomBytes(16).toString('hex')
    session.put('m365OAuthState', state)
    response.header('location', getM365ConnectUrl(state))
    return response.status(302)
  }

  async oauthCallback({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) {
      session.flash('error', 'Only super-admin can connect Microsoft 365 mailboxes.')
      return response.redirect().toPath('/dashboard')
    }

    if (request.input('error')) {
      session.flash('error', request.input('error_description') || 'Microsoft OAuth was cancelled.')
      return response.redirect().toPath('/admin/serviceMail')
    }

    const expectedState = session.pull('m365OAuthState')
    const receivedState = request.input('state')
    if (!expectedState || expectedState !== receivedState) {
      session.flash('error', 'Invalid Microsoft OAuth state.')
      return response.redirect().toPath('/admin/serviceMail')
    }

    const code = request.input('code')
    if (!code) {
      session.flash('error', 'Missing Microsoft authorization code.')
      return response.redirect().toPath('/admin/serviceMail')
    }

    try {
      const account = await connectM365Mailbox(code, user.id)
      session.flash('success', `Mailbox ${account.email} connected`)
    } catch (error) {
      session.flash('error', error instanceof Error ? error.message : 'Unable to connect Microsoft 365 mailbox.')
    }

    return response.redirect().toPath('/admin/serviceMail')
  }

  async updateFolders({ auth, params, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) {
      session.flash('error', 'Only super-admin can update mail folders.')
      return response.redirect().toPath('/dashboard')
    }

    const account = await findMailServiceAccountOrFail(Number(params.id))
    const payload = await request.validateUsing(updateMailServiceFoldersValidator)

    try {
      await updateEnabledFolders(account, payload.folderIds)
      session.flash('success', `Folders updated for ${account.email}`)
    } catch (error) {
      session.flash('error', error instanceof Error ? error.message : 'Unable to update folder sync.')
    }

    return response.redirect().toPath('/admin/serviceMail')
  }

  async refreshFolders({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) {
      session.flash('error', 'Only super-admin can refresh mail folders.')
      return response.redirect().toPath('/dashboard')
    }

    const account = await findMailServiceAccountOrFail(Number(params.id))

    try {
      await syncMailboxFolders(account)
      session.flash('success', `Folder list refreshed for ${account.email}`)
    } catch (error) {
      session.flash('error', error instanceof Error ? error.message : 'Unable to refresh Microsoft folders.')
    }

    return response.redirect().toPath('/admin/serviceMail')
  }

  async syncNow({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isSuperAdmin) {
      session.flash('error', 'Only super-admin can trigger mailbox sync.')
      return response.redirect().toPath('/dashboard')
    }

    const account = await findMailServiceAccountOrFail(Number(params.id))

    try {
      const importedCount = await syncEnabledMailbox(account)
      session.flash('success', `Mailbox synced for ${account.email}. ${importedCount} new ticket(s) imported.`)
    } catch (error) {
      session.flash('error', error instanceof Error ? error.message : 'Unable to sync mailbox.')
    }

    return response.redirect().toPath('/admin/serviceMail')
  }

  async webhook({ request, response, logger }: HttpContext) {
    const validationToken = request.qs().validationToken
    if (typeof validationToken === 'string' && validationToken.length > 0) {
      response.header('Content-Type', 'text/plain')
      return response.send(validationToken)
    }

    const payload = request.body()

    void handleGraphNotificationPayload(payload).catch((error) => {
      logger.error({ err: error }, 'Unable to process Microsoft Graph notification')
    })

    return response.status(202).send({ accepted: true })
  }
}
