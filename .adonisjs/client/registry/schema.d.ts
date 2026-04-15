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
