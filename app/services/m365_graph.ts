import MailServiceAccount from '#models/mail_service_account'
import env from '#start/env'
import { DateTime } from 'luxon'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  scope?: string
}

type GraphFolder = {
  id: string
  displayName: string
  parentFolderId?: string | null
  wellKnownName?: string | null
}

type GraphMessage = {
  id: string
  subject?: string | null
  bodyPreview?: string | null
  internetMessageId?: string | null
  conversationId?: string | null
  receivedDateTime?: string | null
  webLink?: string | null
  from?: {
    emailAddress?: {
      address?: string | null
      name?: string | null
    } | null
  } | null
  body?: {
    contentType?: 'html' | 'text'
    content?: string | null
  } | null
  '@removed'?: Record<string, unknown>
}

type DeltaResponse<T> = {
  value: T[]
  '@odata.nextLink'?: string
  '@odata.deltaLink'?: string
}

const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0'
const M365_SCOPES = ['openid', 'profile', 'email', 'offline_access', 'User.Read', 'Mail.Read']
const SUBSCRIPTION_HOURS = 24

function secretKey() {
  return createHash('sha256').update(String(env.get('APP_KEY'))).digest()
}

function encryptSecret(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', secretKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

function decryptSecret(value: string) {
  const payload = Buffer.from(value, 'base64')
  const iv = payload.subarray(0, 12)
  const tag = payload.subarray(12, 28)
  const encrypted = payload.subarray(28)
  const decipher = createDecipheriv('aes-256-gcm', secretKey(), iv)

  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

function getRequiredEnv(name: 'M365_TENANT_ID' | 'M365_CLIENT_ID' | 'M365_CLIENT_SECRET') {
  const value = env.get(name)
  if (!value) {
    throw new Error(`Missing ${name} environment variable`)
  }
  return value
}

function microsoftLoginBaseUrl() {
  return `https://login.microsoftonline.com/${getRequiredEnv('M365_TENANT_ID')}/oauth2/v2.0`
}

function normalizeGraphPath(path: string) {
  return path.startsWith('https://') ? path : `${GRAPH_BASE_URL}${path}`
}

async function postToken(body: URLSearchParams) {
  const response = await fetch(`${microsoftLoginBaseUrl()}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const payload = (await response.json()) as Record<string, any>
  if (!response.ok) {
    throw new Error(
      payload.error_description || payload.error?.message || 'Unable to authenticate with Microsoft 365'
    )
  }

  return payload as TokenResponse
}

async function getValidAccessToken(account: MailServiceAccount) {
  if (!account.tokenExpiresAt || account.tokenExpiresAt <= DateTime.utc().plus({ minutes: 5 })) {
    await refreshMicrosoftToken(account)
  }

  return decryptSecret(account.accessToken)
}

export function isM365Configured() {
  return !!(
    env.get('M365_TENANT_ID') &&
    env.get('M365_CLIENT_ID') &&
    env.get('M365_CLIENT_SECRET')
  )
}

export function getM365RedirectUrl() {
  return (
    env.get('M365_REDIRECT_URI') ||
    `${env.get('APP_URL').replace(/\/$/, '')}/admin/serviceMail/m365/callback`
  )
}

export function getM365WebhookUrl() {
  return (
    env.get('M365_GRAPH_WEBHOOK_URL') ||
    `${env.get('APP_URL').replace(/\/$/, '')}/webhooks/m365/notifications`
  )
}

export function getM365TenantId() {
  return getRequiredEnv('M365_TENANT_ID')
}

export function buildM365AuthorizationUrl(state: string) {
  const url = new URL(`${microsoftLoginBaseUrl()}/authorize`)

  url.searchParams.set('client_id', getRequiredEnv('M365_CLIENT_ID'))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', getM365RedirectUrl())
  url.searchParams.set('response_mode', 'query')
  url.searchParams.set('scope', M365_SCOPES.join(' '))
  url.searchParams.set('state', state)
  url.searchParams.set('prompt', 'select_account')

  return url.toString()
}

export async function exchangeAuthorizationCode(code: string) {
  const body = new URLSearchParams({
    client_id: getRequiredEnv('M365_CLIENT_ID'),
    client_secret: getRequiredEnv('M365_CLIENT_SECRET'),
    grant_type: 'authorization_code',
    code,
    redirect_uri: getM365RedirectUrl(),
  })

  return postToken(body)
}

export async function refreshMicrosoftToken(account: MailServiceAccount) {
  const body = new URLSearchParams({
    client_id: getRequiredEnv('M365_CLIENT_ID'),
    client_secret: getRequiredEnv('M365_CLIENT_SECRET'),
    grant_type: 'refresh_token',
    refresh_token: decryptSecret(account.refreshToken),
    redirect_uri: getM365RedirectUrl(),
  })

  const tokens = await postToken(body)
  account.accessToken = encryptSecret(tokens.access_token)
  if (tokens.refresh_token) {
    account.refreshToken = encryptSecret(tokens.refresh_token)
  }
  account.scopes = tokens.scope ?? account.scopes
  account.tokenExpiresAt = tokens.expires_in
    ? DateTime.utc().plus({ seconds: tokens.expires_in })
    : account.tokenExpiresAt
  account.lastError = null
  await account.save()

  return account
}

export async function graphRequest<T>(
  account: MailServiceAccount,
  path: string,
  init: RequestInit = {},
  retry = true
) {
  const token = await getValidAccessToken(account)
  const response = await fetch(normalizeGraphPath(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })

  if (response.status === 401 && retry) {
    await refreshMicrosoftToken(account)
    return graphRequest<T>(account, path, init, false)
  }

  if (!response.ok) {
    const payload = await response.text()
    throw new Error(payload || `Graph request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}

export async function fetchMicrosoftMailboxProfile(account: MailServiceAccount) {
  return graphRequest<{
    id: string
    displayName?: string | null
    mail?: string | null
    userPrincipalName?: string | null
  }>(account, '/me?$select=id,displayName,mail,userPrincipalName')
}

export async function listMicrosoftMailFolders(account: MailServiceAccount) {
  const folders: GraphFolder[] = []
  let nextLink: string | undefined =
    '/me/mailFolders/delta?$select=id,displayName,parentFolderId,wellKnownName&$top=100&includeHiddenFolders=true'

  while (nextLink) {
    const page: DeltaResponse<GraphFolder> = await graphRequest(account, nextLink)
    folders.push(...page.value)
    nextLink = page['@odata.nextLink']
  }

  return folders
}

export async function getMessagesDelta(account: MailServiceAccount, folderId: string, deltaLink?: string | null) {
  let nextLink: string | undefined =
    deltaLink ||
    `/me/mailFolders/${encodeURIComponent(folderId)}/messages/delta?$select=id,subject,bodyPreview,body,from,internetMessageId,conversationId,receivedDateTime,webLink&$top=50`

  const messages: GraphMessage[] = []
  let latestDeltaLink = deltaLink ?? null

  while (nextLink) {
    const page: DeltaResponse<GraphMessage> = await graphRequest(account, nextLink)
    messages.push(...page.value)
    latestDeltaLink = page['@odata.deltaLink'] ?? latestDeltaLink
    nextLink = page['@odata.nextLink']
  }

  return { deltaLink: latestDeltaLink, messages }
}

export async function createMailFolderSubscription(account: MailServiceAccount, folderId: string, clientState: string) {
  const resourceFolderId = folderId.replace(/'/g, "''")

  return graphRequest<{
    id: string
    expirationDateTime: string
  }>(account, '/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      changeType: 'created,updated',
      notificationUrl: getM365WebhookUrl(),
      lifecycleNotificationUrl: getM365WebhookUrl(),
      resource: `/me/mailFolders('${resourceFolderId}')/messages`,
      expirationDateTime: DateTime.utc().plus({ hours: SUBSCRIPTION_HOURS }).toISO(),
      clientState,
    }),
  })
}

export async function renewMailFolderSubscription(account: MailServiceAccount, subscriptionId: string) {
  return graphRequest<{
    id: string
    expirationDateTime: string
  }>(account, `/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      expirationDateTime: DateTime.utc().plus({ hours: SUBSCRIPTION_HOURS }).toISO(),
    }),
  })
}

export async function deleteMailFolderSubscription(account: MailServiceAccount, subscriptionId: string) {
  await graphRequest(account, `/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
  })
}

export function serializeTokenBundle(tokens: TokenResponse) {
  return {
    accessToken: encryptSecret(tokens.access_token),
    refreshToken: encryptSecret(tokens.refresh_token || ''),
    scopes: tokens.scope ?? M365_SCOPES.join(' '),
    tokenExpiresAt: tokens.expires_in ? DateTime.utc().plus({ seconds: tokens.expires_in }) : null,
  }
}
