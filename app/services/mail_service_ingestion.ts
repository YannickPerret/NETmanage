import MailServiceAccount from '#models/mail_service_account'
import MailServiceFolder from '#models/mail_service_folder'
import MailServiceMessage from '#models/mail_service_message'
import Ticket from '#models/ticket'
import User from '#models/user'
import Status from '#models/status'
import Priority from '#models/priority'
import Category from '#models/category'
import {
  AWAITING_SLUG,
  broadcastTicketState,
  loadRealtimeTicket,
} from '#services/ticket_realtime'
import { createTicketEvent } from '#services/ticket_events'
import { sendTicketCreatedConfirmation } from '#services/ticket_mailer'
import {
  buildM365AuthorizationUrl,
  createMailFolderSubscription,
  deleteMailFolderSubscription,
  exchangeAuthorizationCode,
  fetchMicrosoftMailboxProfile,
  getM365TenantId,
  getMessagesDelta,
  isM365Configured,
  listMicrosoftMailFolders,
  renewMailFolderSubscription,
  serializeTokenBundle,
} from '#services/m365_graph'
import env from '#start/env'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'

type MicrosoftMessage = Awaited<ReturnType<typeof getMessagesDelta>>['messages'][number]

const FOLDER_SUBSCRIPTION_RENEW_WINDOW_HOURS = 12

function randomToken(size = 24) {
  return randomBytes(size).toString('hex')
}

function normalizeEmail(value?: string | null) {
  return value?.trim().toLowerCase() || null
}

function stripHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function mailBodyToText(message: MicrosoftMessage) {
  const body = message.body?.content?.trim()
  if (body) {
    return message.body?.contentType === 'html' ? stripHtml(body) : body
  }
  return message.bodyPreview?.trim() || ''
}

function buildTicketDescription(
  account: MailServiceAccount,
  folder: MailServiceFolder,
  message: MicrosoftMessage
) {
  const sender = message.from?.emailAddress
  const senderLine = sender?.address
    ? sender.name
      ? `${sender.name} <${sender.address}>`
      : sender.address
    : 'Unknown sender'
  const receivedAt = message.receivedDateTime
    ? DateTime.fromISO(message.receivedDateTime).toFormat('yyyy-LL-dd HH:mm')
    : 'Unknown date'
  const body = mailBodyToText(message)

  return [
    `Source: Microsoft 365 mailbox ${account.email}`,
    `Folder: ${folder.displayName}`,
    `From: ${senderLine}`,
    `Received at: ${receivedAt}`,
    message.webLink ? `Outlook link: ${message.webLink}` : null,
    '',
    body || 'No message body available.',
  ]
    .filter(Boolean)
    .join('\n')
}

async function getDefaultTicketLookups() {
  const [status, priority, category] = await Promise.all([
    Status.findByOrFail('slug', AWAITING_SLUG),
    Priority.findByOrFail('slug', 'medium'),
    Category.findByOrFail('slug', 'request'),
  ])

  return { status, priority, category }
}

async function findOrCreateClientUser(email: string, fullName?: string | null) {
  const existingUser = await User.findBy('email', email)
  if (existingUser) {
    return existingUser
  }

  return User.create({
    email,
    fullName: fullName?.trim() || email,
    password: randomToken(18),
    type: 'client',
    role: null,
  })
}

async function createTicketFromMessage(
  account: MailServiceAccount,
  folder: MailServiceFolder,
  message: MicrosoftMessage
) {
  const sender = message.from?.emailAddress
  const senderEmail = normalizeEmail(sender?.address)
  if (!senderEmail) {
    return null
  }

  const ignoredAddresses = new Set([normalizeEmail(account.email), normalizeEmail(env.get('MAIL_FROM_ADDRESS'))])
  if (ignoredAddresses.has(senderEmail)) {
    return null
  }

  const { status, priority, category } = await getDefaultTicketLookups()
  const issuer = await findOrCreateClientUser(senderEmail, sender?.name)
  const ticket = await Ticket.create({
    title: message.subject?.trim() || '(No subject)',
    description: buildTicketDescription(account, folder, message),
    statusId: status.id,
    priorityId: priority.id,
    categoryId: category.id,
    issuerType: 'user',
    issuerId: issuer.id,
    createdByUserId: issuer.id,
  })

  await createTicketEvent(ticket, {
    type: 'created_from_email',
    description: `Ticket created automatically from Microsoft 365 mailbox ${account.email} (${folder.displayName}).`,
    metadata: {
      mailbox: account.email,
      folder: folder.displayName,
      senderEmail,
    },
  })

  const realtimeTicket = await loadRealtimeTicket(ticket)
  broadcastTicketState(ticket, realtimeTicket)
  await sendTicketCreatedConfirmation(ticket, issuer)

  return ticket
}

async function importMessageIfNeeded(
  account: MailServiceAccount,
  folder: MailServiceFolder,
  message: MicrosoftMessage
) {
  if (message['@removed']) {
    return null
  }

  const alreadyImported = await MailServiceMessage.query()
    .where('mailServiceAccountId', account.id)
    .where('graphMessageId', message.id)
    .first()

  if (alreadyImported) {
    return null
  }

  const ticket = await createTicketFromMessage(account, folder, message)
  if (!ticket) {
    return null
  }

  await MailServiceMessage.create({
    mailServiceAccountId: account.id,
    mailServiceFolderId: folder.id,
    ticketId: ticket.id,
    graphMessageId: message.id,
    internetMessageId: message.internetMessageId ?? null,
    conversationId: message.conversationId ?? null,
    senderEmail: normalizeEmail(message.from?.emailAddress?.address),
    subject: message.subject?.trim() || null,
    receivedAt: message.receivedDateTime ? DateTime.fromISO(message.receivedDateTime) : null,
  })

  return ticket
}

export function getMailServiceAdminSnapshot(account: MailServiceAccount) {
  return {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
    lastError: account.lastError,
    lastSyncedAt: account.lastSyncedAt?.toISO() ?? null,
    tokenExpiresAt: account.tokenExpiresAt?.toISO() ?? null,
    folders: account.folders
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
      .map((folder) => ({
        id: folder.id,
        graphFolderId: folder.graphFolderId,
        displayName: folder.displayName,
        wellKnownName: folder.wellKnownName,
        isEnabled: folder.isEnabled,
        lastError: folder.lastError,
        lastSyncedAt: folder.lastSyncedAt?.toISO() ?? null,
        subscriptionExpiresAt: folder.subscriptionExpiresAt?.toISO() ?? null,
      })),
  }
}

export async function syncMailboxFolders(account: MailServiceAccount) {
  const folders = await listMicrosoftMailFolders(account)

  for (const folder of folders) {
    await MailServiceFolder.updateOrCreate(
      {
        mailServiceAccountId: account.id,
        graphFolderId: folder.id,
      },
      {
        displayName: folder.displayName,
        parentGraphFolderId: folder.parentFolderId ?? null,
        wellKnownName: folder.wellKnownName ?? null,
      }
    )
  }

  account.lastError = null
  await account.load('folders')
  return account
}

async function ensureFolderSubscription(account: MailServiceAccount, folder: MailServiceFolder) {
  const expiringSoon =
    !folder.subscriptionExpiresAt ||
    folder.subscriptionExpiresAt <= DateTime.utc().plus({ hours: FOLDER_SUBSCRIPTION_RENEW_WINDOW_HOURS })

  if (!folder.subscriptionId) {
    const subscription = await createMailFolderSubscription(
      account,
      folder.graphFolderId,
      account.webhookClientState
    )
    folder.subscriptionId = subscription.id
    folder.subscriptionExpiresAt = DateTime.fromISO(subscription.expirationDateTime)
    await folder.save()
    return
  }

  if (!expiringSoon) {
    return
  }

  try {
    const subscription = await renewMailFolderSubscription(account, folder.subscriptionId)
    folder.subscriptionExpiresAt = DateTime.fromISO(subscription.expirationDateTime)
    folder.lastError = null
    await folder.save()
  } catch {
    const subscription = await createMailFolderSubscription(
      account,
      folder.graphFolderId,
      account.webhookClientState
    )
    folder.subscriptionId = subscription.id
    folder.subscriptionExpiresAt = DateTime.fromISO(subscription.expirationDateTime)
    folder.lastError = null
    await folder.save()
  }
}

async function primeFolderDelta(account: MailServiceAccount, folder: MailServiceFolder) {
  const delta = await getMessagesDelta(account, folder.graphFolderId, null)
  folder.deltaLink = delta.deltaLink
  folder.lastSyncedAt = DateTime.utc()
  folder.lastError = null
  await folder.save()
}

export async function updateEnabledFolders(account: MailServiceAccount, graphFolderIds: string[]) {
  await account.load('folders')
  const wantedFolderIds = new Set(graphFolderIds)

  for (const folder of account.folders) {
    const shouldEnable = wantedFolderIds.has(folder.graphFolderId)

    if (!shouldEnable && folder.isEnabled) {
      if (folder.subscriptionId) {
        try {
          await deleteMailFolderSubscription(account, folder.subscriptionId)
        } catch {}
      }
      folder.isEnabled = false
      folder.subscriptionId = null
      folder.subscriptionExpiresAt = null
      folder.deltaLink = null
      folder.lastError = null
      await folder.save()
      continue
    }

    if (shouldEnable && !folder.isEnabled) {
      folder.isEnabled = true
      folder.lastError = null
      await folder.save()
      await primeFolderDelta(account, folder)
      await ensureFolderSubscription(account, folder)
    }
  }

  await account.load('folders')
  return account
}

export async function syncFolderMessages(account: MailServiceAccount, folder: MailServiceFolder, importMessages = true) {
  if (!folder.deltaLink) {
    await primeFolderDelta(account, folder)
    return { importedCount: 0 }
  }

  const delta = await getMessagesDelta(account, folder.graphFolderId, folder.deltaLink)
  let importedCount = 0

  if (importMessages) {
    for (const message of delta.messages) {
      const ticket = await importMessageIfNeeded(account, folder, message)
      if (ticket) {
        importedCount += 1
      }
    }
  }

  folder.deltaLink = delta.deltaLink
  folder.lastSyncedAt = DateTime.utc()
  folder.lastError = null
  await folder.save()

  return { importedCount }
}

export async function syncEnabledMailbox(account: MailServiceAccount) {
  await account.load('folders')
  let importedCount = 0

  for (const folder of account.folders.filter((entry) => entry.isEnabled)) {
    await ensureFolderSubscription(account, folder)
    const result = await syncFolderMessages(account, folder, true)
    importedCount += result.importedCount
  }

  account.lastSyncedAt = DateTime.utc()
  account.lastError = null
  await account.save()

  return importedCount
}

export async function connectM365Mailbox(code: string, connectedByUserId: number) {
  if (!isM365Configured()) {
    throw new Error('Microsoft 365 is not configured yet.')
  }

  const tokens = await exchangeAuthorizationCode(code)
  const serializedTokens = serializeTokenBundle(tokens)
  const temporaryAccount = new MailServiceAccount()
  temporaryAccount.accessToken = serializedTokens.accessToken
  temporaryAccount.refreshToken = serializedTokens.refreshToken
  temporaryAccount.scopes = serializedTokens.scopes
  temporaryAccount.tokenExpiresAt = serializedTokens.tokenExpiresAt
  temporaryAccount.microsoftTenantId = getM365TenantId()
  temporaryAccount.microsoftUserId = 'pending'
  temporaryAccount.email = 'pending'
  temporaryAccount.provider = 'm365'
  temporaryAccount.webhookClientState = randomToken(16)

  const profile = await fetchMicrosoftMailboxProfile(temporaryAccount)
  const email = normalizeEmail(profile.mail || profile.userPrincipalName)
  if (!email) {
    throw new Error('Microsoft 365 did not return a mailbox address for this account.')
  }

  const account = await MailServiceAccount.updateOrCreate(
    { email },
    {
      provider: 'm365',
      email,
      displayName: profile.displayName ?? null,
      microsoftTenantId: getM365TenantId(),
      microsoftUserId: profile.id,
      accessToken: serializedTokens.accessToken,
      refreshToken: serializedTokens.refreshToken,
      scopes: serializedTokens.scopes,
      tokenExpiresAt: serializedTokens.tokenExpiresAt,
      connectedByUserId,
      lastError: null,
      webhookClientState: randomToken(16),
    }
  )

  await syncMailboxFolders(account)
  return account
}

export function getM365ConnectUrl(state: string) {
  return buildM365AuthorizationUrl(state)
}

export async function findMailServiceAccountOrFail(accountId: number) {
  return MailServiceAccount.query().where('id', accountId).preload('folders').firstOrFail()
}

export async function listMailServiceAccounts() {
  return MailServiceAccount.query().preload('folders').orderBy('email', 'asc')
}

export async function handleGraphNotificationPayload(payload: {
  value?: Array<{
    subscriptionId?: string
    clientState?: string
    lifecycleEvent?: string
  }>
}) {
  const notifications = payload.value ?? []
  const subscriptionIds = notifications.map((entry) => entry.subscriptionId).filter(Boolean) as string[]
  if (subscriptionIds.length === 0) {
    return
  }

  const folders = await MailServiceFolder.query()
    .whereIn('subscriptionId', subscriptionIds)
    .preload('account')

  const foldersBySubscription = new Map(
    folders
      .filter((folder) => folder.subscriptionId)
      .map((folder) => [folder.subscriptionId!, folder])
  )

  for (const notification of notifications) {
    const folder = notification.subscriptionId
      ? foldersBySubscription.get(notification.subscriptionId)
      : null

    if (!folder || notification.clientState !== folder.account.webhookClientState) {
      continue
    }

    if (notification.lifecycleEvent === 'subscriptionRemoved') {
      folder.subscriptionId = null
      folder.subscriptionExpiresAt = null
      await folder.save()
      continue
    }

    await syncFolderMessages(folder.account, folder, true)
  }
}

export async function runMailServiceMaintenance() {
  const accounts = await MailServiceAccount.query().preload('folders')

  for (const account of accounts) {
    try {
      await syncEnabledMailbox(account)
    } catch (error) {
      account.lastError = error instanceof Error ? error.message : 'Mailbox sync failed'
      await account.save()
    }
  }
}
