import vine from '@vinejs/vine'

export const createPostCommentValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1).maxLength(255),
  })
)
