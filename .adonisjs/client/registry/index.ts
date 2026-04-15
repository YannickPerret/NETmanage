/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'tickets.confirm_close_page': {
    methods: ["GET","HEAD"],
    pattern: '/tickets/:id/close/confirm',
    tokens: [{"old":"/tickets/:id/close/confirm","type":0,"val":"tickets","end":""},{"old":"/tickets/:id/close/confirm","type":1,"val":"id","end":""},{"old":"/tickets/:id/close/confirm","type":0,"val":"close","end":""},{"old":"/tickets/:id/close/confirm","type":0,"val":"confirm","end":""}],
    types: placeholder as Registry['tickets.confirm_close_page']['types'],
  },
  'tickets.confirm_close': {
    methods: ["POST"],
    pattern: '/tickets/:id/close/confirm',
    tokens: [{"old":"/tickets/:id/close/confirm","type":0,"val":"tickets","end":""},{"old":"/tickets/:id/close/confirm","type":1,"val":"id","end":""},{"old":"/tickets/:id/close/confirm","type":0,"val":"close","end":""},{"old":"/tickets/:id/close/confirm","type":0,"val":"confirm","end":""}],
    types: placeholder as Registry['tickets.confirm_close']['types'],
  },
  'tickets.satisfaction_page': {
    methods: ["GET","HEAD"],
    pattern: '/tickets/:id/satisfaction',
    tokens: [{"old":"/tickets/:id/satisfaction","type":0,"val":"tickets","end":""},{"old":"/tickets/:id/satisfaction","type":1,"val":"id","end":""},{"old":"/tickets/:id/satisfaction","type":0,"val":"satisfaction","end":""}],
    types: placeholder as Registry['tickets.satisfaction_page']['types'],
  },
  'tickets.submit_satisfaction': {
    methods: ["POST"],
    pattern: '/tickets/:id/satisfaction',
    tokens: [{"old":"/tickets/:id/satisfaction","type":0,"val":"tickets","end":""},{"old":"/tickets/:id/satisfaction","type":1,"val":"id","end":""},{"old":"/tickets/:id/satisfaction","type":0,"val":"satisfaction","end":""}],
    types: placeholder as Registry['tickets.submit_satisfaction']['types'],
  },
  'mail_services.webhook': {
    methods: ["POST"],
    pattern: '/webhooks/m365/notifications',
    tokens: [{"old":"/webhooks/m365/notifications","type":0,"val":"webhooks","end":""},{"old":"/webhooks/m365/notifications","type":0,"val":"m365","end":""},{"old":"/webhooks/m365/notifications","type":0,"val":"notifications","end":""}],
    types: placeholder as Registry['mail_services.webhook']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard']['types'],
  },
  'satisfactions.index': {
    methods: ["GET","HEAD"],
    pattern: '/satisfactions',
    tokens: [{"old":"/satisfactions","type":0,"val":"satisfactions","end":""}],
    types: placeholder as Registry['satisfactions.index']['types'],
  },
  'tickets.index': {
    methods: ["GET","HEAD"],
    pattern: '/tickets',
    tokens: [{"old":"/tickets","type":0,"val":"tickets","end":""}],
    types: placeholder as Registry['tickets.index']['types'],
  },
  'tickets.show': {
    methods: ["GET","HEAD"],
    pattern: '/tickets/:id',
    tokens: [{"old":"/tickets/:id","type":0,"val":"tickets","end":""},{"old":"/tickets/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['tickets.show']['types'],
  },
  'companies.index': {
    methods: ["GET","HEAD"],
    pattern: '/companies',
    tokens: [{"old":"/companies","type":0,"val":"companies","end":""}],
    types: placeholder as Registry['companies.index']['types'],
  },
  'companies.show': {
    methods: ["GET","HEAD"],
    pattern: '/companies/:id',
    tokens: [{"old":"/companies/:id","type":0,"val":"companies","end":""},{"old":"/companies/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['companies.show']['types'],
  },
  'tickets.store': {
    methods: ["POST"],
    pattern: '/tickets',
    tokens: [{"old":"/tickets","type":0,"val":"tickets","end":""}],
    types: placeholder as Registry['tickets.store']['types'],
  },
  'tickets.open': {
    methods: ["POST"],
    pattern: '/tickets/:id/open',
    tokens: [{"old":"/tickets/:id/open","type":0,"val":"tickets","end":""},{"old":"/tickets/:id/open","type":1,"val":"id","end":""},{"old":"/tickets/:id/open","type":0,"val":"open","end":""}],
    types: placeholder as Registry['tickets.open']['types'],
  },
  'tickets.set_parent': {
    methods: ["POST"],
    pattern: '/tickets/:id/parent',
    tokens: [{"old":"/tickets/:id/parent","type":0,"val":"tickets","end":""},{"old":"/tickets/:id/parent","type":1,"val":"id","end":""},{"old":"/tickets/:id/parent","type":0,"val":"parent","end":""}],
    types: placeholder as Registry['tickets.set_parent']['types'],
  },
  'tickets.remove_parent': {
    methods: ["POST"],
    pattern: '/tickets/:id/parent/remove',
    tokens: [{"old":"/tickets/:id/parent/remove","type":0,"val":"tickets","end":""},{"old":"/tickets/:id/parent/remove","type":1,"val":"id","end":""},{"old":"/tickets/:id/parent/remove","type":0,"val":"parent","end":""},{"old":"/tickets/:id/parent/remove","type":0,"val":"remove","end":""}],
    types: placeholder as Registry['tickets.remove_parent']['types'],
  },
  'tickets.resolve': {
    methods: ["POST"],
    pattern: '/tickets/:id/resolve',
    tokens: [{"old":"/tickets/:id/resolve","type":0,"val":"tickets","end":""},{"old":"/tickets/:id/resolve","type":1,"val":"id","end":""},{"old":"/tickets/:id/resolve","type":0,"val":"resolve","end":""}],
    types: placeholder as Registry['tickets.resolve']['types'],
  },
  'mail_services.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/serviceMail',
    tokens: [{"old":"/admin/serviceMail","type":0,"val":"admin","end":""},{"old":"/admin/serviceMail","type":0,"val":"serviceMail","end":""}],
    types: placeholder as Registry['mail_services.index']['types'],
  },
  'mail_services.start_oauth': {
    methods: ["POST"],
    pattern: '/admin/serviceMail/m365/connect',
    tokens: [{"old":"/admin/serviceMail/m365/connect","type":0,"val":"admin","end":""},{"old":"/admin/serviceMail/m365/connect","type":0,"val":"serviceMail","end":""},{"old":"/admin/serviceMail/m365/connect","type":0,"val":"m365","end":""},{"old":"/admin/serviceMail/m365/connect","type":0,"val":"connect","end":""}],
    types: placeholder as Registry['mail_services.start_oauth']['types'],
  },
  'mail_services.oauth_callback': {
    methods: ["GET","HEAD"],
    pattern: '/admin/serviceMail/m365/callback',
    tokens: [{"old":"/admin/serviceMail/m365/callback","type":0,"val":"admin","end":""},{"old":"/admin/serviceMail/m365/callback","type":0,"val":"serviceMail","end":""},{"old":"/admin/serviceMail/m365/callback","type":0,"val":"m365","end":""},{"old":"/admin/serviceMail/m365/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['mail_services.oauth_callback']['types'],
  },
  'mail_services.update_folders': {
    methods: ["POST"],
    pattern: '/admin/serviceMail/accounts/:id/folders',
    tokens: [{"old":"/admin/serviceMail/accounts/:id/folders","type":0,"val":"admin","end":""},{"old":"/admin/serviceMail/accounts/:id/folders","type":0,"val":"serviceMail","end":""},{"old":"/admin/serviceMail/accounts/:id/folders","type":0,"val":"accounts","end":""},{"old":"/admin/serviceMail/accounts/:id/folders","type":1,"val":"id","end":""},{"old":"/admin/serviceMail/accounts/:id/folders","type":0,"val":"folders","end":""}],
    types: placeholder as Registry['mail_services.update_folders']['types'],
  },
  'mail_services.refresh_folders': {
    methods: ["POST"],
    pattern: '/admin/serviceMail/accounts/:id/folders/refresh',
    tokens: [{"old":"/admin/serviceMail/accounts/:id/folders/refresh","type":0,"val":"admin","end":""},{"old":"/admin/serviceMail/accounts/:id/folders/refresh","type":0,"val":"serviceMail","end":""},{"old":"/admin/serviceMail/accounts/:id/folders/refresh","type":0,"val":"accounts","end":""},{"old":"/admin/serviceMail/accounts/:id/folders/refresh","type":1,"val":"id","end":""},{"old":"/admin/serviceMail/accounts/:id/folders/refresh","type":0,"val":"folders","end":""},{"old":"/admin/serviceMail/accounts/:id/folders/refresh","type":0,"val":"refresh","end":""}],
    types: placeholder as Registry['mail_services.refresh_folders']['types'],
  },
  'mail_services.sync_now': {
    methods: ["POST"],
    pattern: '/admin/serviceMail/accounts/:id/sync',
    tokens: [{"old":"/admin/serviceMail/accounts/:id/sync","type":0,"val":"admin","end":""},{"old":"/admin/serviceMail/accounts/:id/sync","type":0,"val":"serviceMail","end":""},{"old":"/admin/serviceMail/accounts/:id/sync","type":0,"val":"accounts","end":""},{"old":"/admin/serviceMail/accounts/:id/sync","type":1,"val":"id","end":""},{"old":"/admin/serviceMail/accounts/:id/sync","type":0,"val":"sync","end":""}],
    types: placeholder as Registry['mail_services.sync_now']['types'],
  },
  'announcements.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/announcements',
    tokens: [{"old":"/admin/announcements","type":0,"val":"admin","end":""},{"old":"/admin/announcements","type":0,"val":"announcements","end":""}],
    types: placeholder as Registry['announcements.index']['types'],
  },
  'announcements.store': {
    methods: ["POST"],
    pattern: '/admin/announcements',
    tokens: [{"old":"/admin/announcements","type":0,"val":"admin","end":""},{"old":"/admin/announcements","type":0,"val":"announcements","end":""}],
    types: placeholder as Registry['announcements.store']['types'],
  },
  'announcements.update': {
    methods: ["POST"],
    pattern: '/admin/announcements/:id',
    tokens: [{"old":"/admin/announcements/:id","type":0,"val":"admin","end":""},{"old":"/admin/announcements/:id","type":0,"val":"announcements","end":""},{"old":"/admin/announcements/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['announcements.update']['types'],
  },
  'announcements.destroy': {
    methods: ["POST"],
    pattern: '/admin/announcements/:id/delete',
    tokens: [{"old":"/admin/announcements/:id/delete","type":0,"val":"admin","end":""},{"old":"/admin/announcements/:id/delete","type":0,"val":"announcements","end":""},{"old":"/admin/announcements/:id/delete","type":1,"val":"id","end":""},{"old":"/admin/announcements/:id/delete","type":0,"val":"delete","end":""}],
    types: placeholder as Registry['announcements.destroy']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
