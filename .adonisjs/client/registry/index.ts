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
  'tickets.resolve': {
    methods: ["POST"],
    pattern: '/tickets/:id/resolve',
    tokens: [{"old":"/tickets/:id/resolve","type":0,"val":"tickets","end":""},{"old":"/tickets/:id/resolve","type":1,"val":"id","end":""},{"old":"/tickets/:id/resolve","type":0,"val":"resolve","end":""}],
    types: placeholder as Registry['tickets.resolve']['types'],
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
