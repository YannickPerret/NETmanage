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
    store: typeof routes['tickets.store']
    open: typeof routes['tickets.open']
    resolve: typeof routes['tickets.resolve']
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
}
