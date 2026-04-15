import Attachment from '#models/attachment'
import factory from '@adonisjs/lucid/factories'

export const AttachmentFactory = factory
  .define(Attachment, async ({ faker }) => {
    const filename = faker.system.commonFileName()
    return {
      attachableType: 'ticket' as const,
      attachableId: 1,
      filename,
      path: `uploads/tickets/${filename}`,
      size: faker.number.int({ min: 1024, max: 5_000_000 }),
      mimeType: faker.system.mimeType(),
    }
  })
  .build()
