import Ticket from '#models/ticket'
import User from '#models/user'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'

function formatRecipient(user: User) {
  return user.fullName ? `${user.fullName} <${user.email}>` : user.email
}

function ticketUrl() {
  return new URL('/tickets', env.get('APP_URL')).toString()
}

function ticketActionUrl(path: string) {
  return new URL(path, env.get('APP_URL')).toString()
}

async function safelySend(context: string, callback: () => Promise<void>) {
  try {
    await callback()
  } catch (error) {
    logger.warn({ err: error, context }, 'Mail delivery failed')
  }
}

export async function sendTicketCreatedConfirmation(ticket: Ticket, client: User) {
  await safelySend('ticket_created_confirmation', async () => {
    await mail.send((message) => {
      message
        .to(client.email, client.fullName ?? undefined)
        .subject(`Ticket #${ticket.id} created`)
        .text(
          [
            `Bonjour ${client.fullName ?? client.email},`,
            '',
            `Votre ticket #${ticket.id} a bien ete cree.`,
            `Titre: ${ticket.title}`,
            `Statut: ${ticket.status?.name ?? 'Unknown'}`,
            `Acces: ${ticketUrl()}`,
          ].join('\n')
        )
        .html(
          [
            `<p>Bonjour ${client.fullName ?? client.email},</p>`,
            `<p>Votre ticket <strong>#${ticket.id}</strong> a bien ete cree.</p>`,
            `<p><strong>Titre:</strong> ${ticket.title}<br /><strong>Statut:</strong> ${ticket.status?.name ?? 'Unknown'}</p>`,
            `<p><a href="${ticketUrl()}">Voir les tickets</a></p>`,
          ].join('')
        )
    })
  })
}

export async function sendTicketAssignedNotifications(ticket: Ticket, technicians: User[]) {
  await Promise.all(
    technicians.map((technician) =>
      safelySend('ticket_assigned_notification', async () => {
        await mail.send((message) => {
          message
            .to(technician.email, technician.fullName ?? undefined)
            .subject(`Ticket #${ticket.id} assigned`)
            .text(
              [
                `Bonjour ${technician.fullName ?? technician.email},`,
                '',
                `Le ticket #${ticket.id} vous a ete assigne.`,
                `Titre: ${ticket.title}`,
                `Acces: ${ticketUrl()}`,
              ].join('\n')
            )
            .html(
              [
                `<p>Bonjour ${technician.fullName ?? technician.email},</p>`,
                `<p>Le ticket <strong>#${ticket.id}</strong> vous a ete assigne.</p>`,
                `<p><strong>Titre:</strong> ${ticket.title}</p>`,
                `<p><a href="${ticketUrl()}">Voir les tickets</a></p>`,
              ].join('')
            )
        })
      })
    )
  )
}

export async function sendTicketOpenedNotification(ticket: Ticket, client: User, technician: User) {
  await safelySend('ticket_opened_notification', async () => {
    await mail.send((message) => {
      message
        .to(client.email, client.fullName ?? undefined)
        .subject(`Ticket #${ticket.id} taken in charge`)
        .text(
          [
            `Bonjour ${client.fullName ?? client.email},`,
            '',
            `Votre ticket #${ticket.id} est maintenant pris en charge.`,
            `Technicien: ${formatRecipient(technician)}`,
            `Titre: ${ticket.title}`,
            `Statut: ${ticket.status?.name ?? 'Unknown'}`,
            `Acces: ${ticketUrl()}`,
          ].join('\n')
        )
        .html(
          [
            `<p>Bonjour ${client.fullName ?? client.email},</p>`,
            `<p>Votre ticket <strong>#${ticket.id}</strong> est maintenant pris en charge.</p>`,
            `<p><strong>Technicien:</strong> ${technician.fullName ?? technician.email}<br /><strong>Titre:</strong> ${ticket.title}<br /><strong>Statut:</strong> ${ticket.status?.name ?? 'Unknown'}</p>`,
            `<p><a href="${ticketUrl()}">Voir les tickets</a></p>`,
          ].join('')
        )
    })
  })
}

export async function sendTicketClosureConfirmationRequest(ticket: Ticket, client: User) {
  if (!ticket.closeConfirmationToken) {
    return
  }

  const confirmationUrl = ticketActionUrl(
    `/tickets/${ticket.id}/close/confirm?token=${ticket.closeConfirmationToken}`
  )

  await safelySend('ticket_closure_confirmation_request', async () => {
    await mail.send((message) => {
      message
        .to(client.email, client.fullName ?? undefined)
        .subject(`Ticket #${ticket.id} resolved`)
        .text(
          [
            `Bonjour ${client.fullName ?? client.email},`,
            '',
            `Le ticket #${ticket.id} est marque comme resolu.`,
            `Titre: ${ticket.title}`,
            'Si tout est bon, merci de confirmer la fermeture via le lien ci-dessous.',
            confirmationUrl,
            '',
            'Sans action de votre part, le ticket sera ferme automatiquement dans 2 jours.',
          ].join('\n')
        )
        .html(
          [
            `<p>Bonjour ${client.fullName ?? client.email},</p>`,
            `<p>Le ticket <strong>#${ticket.id}</strong> est marque comme resolu.</p>`,
            `<p><strong>Titre:</strong> ${ticket.title}</p>`,
            `<p>Si tout est bon, merci de confirmer la fermeture.</p>`,
            `<p><a href="${confirmationUrl}">Confirmer la fermeture</a></p>`,
            `<p>Sans action de votre part, le ticket sera ferme automatiquement dans 2 jours.</p>`,
          ].join('')
        )
    })
  })
}

export async function sendTicketClosedSatisfactionRequest(ticket: Ticket, client: User) {
  if (!ticket.satisfactionToken) {
    return
  }

  const satisfactionUrl = ticketActionUrl(
    `/tickets/${ticket.id}/satisfaction?token=${ticket.satisfactionToken}`
  )

  await safelySend('ticket_closed_satisfaction_request', async () => {
    await mail.send((message) => {
      message
        .to(client.email, client.fullName ?? undefined)
        .subject(`Ticket #${ticket.id} closed`)
        .text(
          [
            `Bonjour ${client.fullName ?? client.email},`,
            '',
            `Le ticket #${ticket.id} est maintenant ferme.`,
            'Merci de partager votre satisfaction via le lien ci-dessous :',
            satisfactionUrl,
          ].join('\n')
        )
        .html(
          [
            `<p>Bonjour ${client.fullName ?? client.email},</p>`,
            `<p>Le ticket <strong>#${ticket.id}</strong> est maintenant ferme.</p>`,
            `<p>Merci de partager votre satisfaction.</p>`,
            `<p><a href="${satisfactionUrl}">Donner mon avis</a></p>`,
          ].join('')
        )
    })
  })
}
