import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const smtpUsername = env.get('SMTP_USERNAME')
const smtpPassword = env.get('SMTP_PASSWORD')

const mailConfig = defineConfig({
  default: 'smtp',

  from: {
    address: env.get('MAIL_FROM_ADDRESS') ?? 'no-reply@netmanage.local',
    name: env.get('MAIL_FROM_NAME') ?? 'NetManage',
  },

  globals: {
    brandName: 'NetManage',
  },

  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST') ?? '127.0.0.1',
      port: env.get('SMTP_PORT') ?? 1025,
      secure: false,
      ignoreTLS: true,
      auth:
        smtpUsername && smtpPassword
          ? {
              type: 'login',
              user: smtpUsername,
              pass: smtpPassword,
            }
          : undefined,
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
