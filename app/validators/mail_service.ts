import vine from '@vinejs/vine'

export const updateMailServiceFoldersValidator = vine.create({
  folderIds: vine.array(vine.string().trim().minLength(1)),
})
