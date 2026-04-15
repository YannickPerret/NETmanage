/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'tickets.confirm_close_page': {
    methods: ["GET","HEAD"]
    pattern: '/tickets/:id/close/confirm'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['confirmClosePage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['confirmClosePage']>>>
    }
  }
  'tickets.confirm_close': {
    methods: ["POST"]
    pattern: '/tickets/:id/close/confirm'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['confirmClose']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['confirmClose']>>>
    }
  }
  'tickets.satisfaction_page': {
    methods: ["GET","HEAD"]
    pattern: '/tickets/:id/satisfaction'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['satisfactionPage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['satisfactionPage']>>>
    }
  }
  'tickets.submit_satisfaction': {
    methods: ["POST"]
    pattern: '/tickets/:id/satisfaction'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/ticket').submitTicketSatisfactionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/ticket').submitTicketSatisfactionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['submitSatisfaction']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['submitSatisfaction']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'mail_services.webhook': {
    methods: ["POST"]
    pattern: '/webhooks/m365/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['webhook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['webhook']>>>
    }
  }
  'new_account.create': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
    }
  }
  'dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['index']>>>
    }
  }
  'satisfactions.index': {
    methods: ["GET","HEAD"]
    pattern: '/satisfactions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['satisfactions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['satisfactions']>>>
    }
  }
  'tickets.index': {
    methods: ["GET","HEAD"]
    pattern: '/tickets'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['list']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['list']>>>
    }
  }
  'tickets.show': {
    methods: ["GET","HEAD"]
    pattern: '/tickets/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['show']>>>
    }
  }
  'companies.index': {
    methods: ["GET","HEAD"]
    pattern: '/companies'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/companies_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/companies_controller').default['index']>>>
    }
  }
  'companies.show': {
    methods: ["GET","HEAD"]
    pattern: '/companies/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/companies_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/companies_controller').default['show']>>>
    }
  }
  'tickets.store': {
    methods: ["POST"]
    pattern: '/tickets'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/ticket').createTicketValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/ticket').createTicketValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'tickets.open': {
    methods: ["POST"]
    pattern: '/tickets/:id/open'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['open']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['open']>>>
    }
  }
  'tickets.set_parent': {
    methods: ["POST"]
    pattern: '/tickets/:id/parent'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/ticket').updateTicketParentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/ticket').updateTicketParentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['setParent']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['setParent']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'tickets.remove_parent': {
    methods: ["POST"]
    pattern: '/tickets/:id/parent/remove'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['removeParent']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['removeParent']>>>
    }
  }
  'tickets.resolve': {
    methods: ["POST"]
    pattern: '/tickets/:id/resolve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['resolve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tickets_controller').default['resolve']>>>
    }
  }
  'mail_services.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/serviceMail'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['index']>>>
    }
  }
  'mail_services.start_oauth': {
    methods: ["POST"]
    pattern: '/admin/serviceMail/m365/connect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['startOauth']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['startOauth']>>>
    }
  }
  'mail_services.oauth_callback': {
    methods: ["GET","HEAD"]
    pattern: '/admin/serviceMail/m365/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['oauthCallback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['oauthCallback']>>>
    }
  }
  'mail_services.update_folders': {
    methods: ["POST"]
    pattern: '/admin/serviceMail/accounts/:id/folders'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/mail_service').updateMailServiceFoldersValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/mail_service').updateMailServiceFoldersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['updateFolders']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['updateFolders']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'mail_services.refresh_folders': {
    methods: ["POST"]
    pattern: '/admin/serviceMail/accounts/:id/folders/refresh'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['refreshFolders']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['refreshFolders']>>>
    }
  }
  'mail_services.sync_now': {
    methods: ["POST"]
    pattern: '/admin/serviceMail/accounts/:id/sync'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['syncNow']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mail_services_controller').default['syncNow']>>>
    }
  }
  'announcements.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/announcements'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['index']>>>
    }
  }
  'announcements.store': {
    methods: ["POST"]
    pattern: '/admin/announcements'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/announcement').createAnnouncementValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/announcement').createAnnouncementValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'announcements.update': {
    methods: ["POST"]
    pattern: '/admin/announcements/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/announcement').updateAnnouncementValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/announcement').updateAnnouncementValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'announcements.destroy': {
    methods: ["POST"]
    pattern: '/admin/announcements/:id/delete'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['destroy']>>>
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
}
