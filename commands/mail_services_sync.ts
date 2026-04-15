import { BaseCommand } from '@adonisjs/core/ace'
import { runMailServiceMaintenance } from '#services/mail_service_ingestion'

export default class MailServicesSync extends BaseCommand {
  static commandName = 'mail-services:sync'
  static description = 'Renews Microsoft 365 subscriptions and imports new emails as tickets'
  static options = {
    startApp: true,
  }

  async run() {
    await runMailServiceMaintenance()
    this.logger.info('Mail service maintenance completed')
  }
}
