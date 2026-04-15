import vine from '@vinejs/vine'

export const createTicketValidator = vine.create({
  title: vine.string().trim().minLength(3).maxLength(200),
  description: vine.string().trim().minLength(3),
  priorityId: vine.number().positive(),
  categoryId: vine.number().positive(),
  groupIds: vine.array(vine.number().positive()).optional(),
  technicianIds: vine.array(vine.number().positive()).optional(),
})

export const submitTicketSatisfactionValidator = vine.create({
  rating: vine.number().min(1).max(5),
  comment: vine.string().trim().maxLength(2000).optional(),
})
