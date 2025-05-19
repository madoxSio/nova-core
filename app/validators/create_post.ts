import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1).maxLength(255),
    image: vine
      .file({
        size: 1024 * 1024 * 5, // 5MB
        extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      })
      .optional(),
  })
)
