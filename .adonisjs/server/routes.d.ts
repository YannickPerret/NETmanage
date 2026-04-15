import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'tickets.confirm_close_page': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.confirm_close': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.satisfaction_page': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.submit_satisfaction': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mail_services.webhook': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'satisfactions.index': { paramsTuple?: []; params?: {} }
    'tickets.index': { paramsTuple?: []; params?: {} }
    'tickets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'companies.index': { paramsTuple?: []; params?: {} }
    'companies.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.store': { paramsTuple?: []; params?: {} }
    'tickets.open': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.set_parent': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.remove_parent': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.resolve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mail_services.index': { paramsTuple?: []; params?: {} }
    'mail_services.start_oauth': { paramsTuple?: []; params?: {} }
    'mail_services.oauth_callback': { paramsTuple?: []; params?: {} }
    'mail_services.update_folders': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mail_services.refresh_folders': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mail_services.sync_now': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'announcements.index': { paramsTuple?: []; params?: {} }
    'announcements.store': { paramsTuple?: []; params?: {} }
    'announcements.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'announcements.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'tickets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'companies.index': { paramsTuple?: []; params?: {} }
    'companies.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mail_services.index': { paramsTuple?: []; params?: {} }
    'mail_services.oauth_callback': { paramsTuple?: []; params?: {} }
    'announcements.index': { paramsTuple?: []; params?: {} }
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
    'tickets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'companies.index': { paramsTuple?: []; params?: {} }
    'companies.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mail_services.index': { paramsTuple?: []; params?: {} }
    'mail_services.oauth_callback': { paramsTuple?: []; params?: {} }
    'announcements.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'tickets.confirm_close': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.submit_satisfaction': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mail_services.webhook': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'tickets.store': { paramsTuple?: []; params?: {} }
    'tickets.open': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.set_parent': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.remove_parent': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tickets.resolve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mail_services.start_oauth': { paramsTuple?: []; params?: {} }
    'mail_services.update_folders': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mail_services.refresh_folders': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mail_services.sync_now': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'announcements.store': { paramsTuple?: []; params?: {} }
    'announcements.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'announcements.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}