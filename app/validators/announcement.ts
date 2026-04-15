import vine from '@vinejs/vine'

const variantRule = vine.enum(['info', 'success', 'warning', 'danger'] as const)

export const createAnnouncementValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(191),
    body: vine.string().trim().minLength(1).maxLength(2000),
    variant: variantRule,
    position: vine.number().min(0).optional(),
    startsAt: vine.string().trim().optional().nullable(),
    endsAt: vine.string().trim().optional().nullable(),
  })
)

export const updateAnnouncementValidator = createAnnouncementValidator
