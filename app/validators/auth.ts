import vine from '@vinejs/vine'

export const createAuthValidator = vine.compile(
  vine.object({
    username: vine.string().trim().minLength(3).maxLength(20),
    firstName: vine.string().trim().minLength(3).maxLength(20),
    lastName: vine.string().trim().minLength(3).maxLength(20),
    birthDate: vine.date({
      formats: ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY', 'DD.MM.YYYY'],
    }),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(6).maxLength(20),
    avatar: vine
      .file({
        size: 1024 * 1024 * 5, // 5MB
        extnames: ['jpg', 'jpeg', 'png', 'gif'],
      })
      .nullable(),
  })
)
