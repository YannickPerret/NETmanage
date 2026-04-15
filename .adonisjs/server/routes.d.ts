import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'tickets.confirm_close_page': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.confirm_close': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.satisfaction_page': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.submit_satisfaction': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'satisfactions.index': { paramsTuple?: []; params?: {} }
    'tickets.index': { paramsTuple?: []; params?: {} }
    'tickets.store': { paramsTuple?: []; params?: {} }
    'tickets.open': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.resolve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'tickets.confirm_close_page': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.satisfaction_page': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'satisfactions.index': { paramsTuple?: []; params?: {} }
    'tickets.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'tickets.confirm_close_page': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.satisfaction_page': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'satisfactions.index': { paramsTuple?: []; params?: {} }
    'tickets.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'tickets.confirm_close': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.submit_satisfaction': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'tickets.store': { paramsTuple?: []; params?: {} }
    'tickets.open': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.resolve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}