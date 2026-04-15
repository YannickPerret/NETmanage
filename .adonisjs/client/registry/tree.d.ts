/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  tickets: {
    confirmClosePage: typeof routes['tickets.confirm_close_page']
    confirmClose: typeof routes['tickets.confirm_close']
    satisfactionPage: typeof routes['tickets.satisfaction_page']
    submitSatisfaction: typeof routes['tickets.submit_satisfaction']
    index: typeof routes['tickets.index']
    show: typeof routes['tickets.show']
    store: typeof routes['tickets.store']
    open: typeof routes['tickets.open']
    setParent: typeof routes['tickets.set_parent']
    removeParent: typeof routes['tickets.remove_parent']
    resolve: typeof routes['tickets.resolve']
  }
  mailServices: {
    webhook: typeof routes['mail_services.webhook']
    index: typeof routes['mail_services.index']
    startOauth: typeof routes['mail_services.start_oauth']
    oauthCallback: typeof routes['mail_services.oauth_callback']
    updateFolders: typeof routes['mail_services.update_folders']
    refreshFolders: typeof routes['mail_services.refresh_folders']
    syncNow: typeof routes['mail_services.sync_now']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  dashboard: typeof routes['dashboard']
  satisfactions: {
    index: typeof routes['satisfactions.index']
  }
  companies: {
    index: typeof routes['companies.index']
    show: typeof routes['companies.show']
  }
  announcements: {
    index: typeof routes['announcements.index']
    store: typeof routes['announcements.store']
    update: typeof routes['announcements.update']
    destroy: typeof routes['announcements.destroy']
  }
}
