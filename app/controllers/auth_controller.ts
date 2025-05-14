import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { createAuthValidator } from '#validators/auth'

export default class AuthController {
  /**
   * @store
   * @description Register a new user
   * @requestBody <createAuthValidator>
   * @responseBody 201 - <User>
   * @responseHeader 201 - X-pages - A description of the header - @example(test)
   */
  public async store({ request, response }: HttpContext) {
    const payload = await createAuthValidator.validate(
      request.only(['email', 'password', 'firstName', 'lastName', 'birthDate', 'username'])
    )

    if (await User.findBy('email', payload.email)) {
      return response.badRequest({ message: 'Email already exists' })
    }

    if (await User.findBy('username', payload.username)) {
      return response.badRequest({ message: 'Username already exists' })
    }

    const user = await User.create(payload)
    return response.created(user)
  }

  /**
   * @index
   * @description Login a user
   * @requestBody <User>
   * @responseBody 200 - <User>
   */
  public async index({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.findBy('email', email)
    if (!user) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await hash.verify(user.password, password)
    if (!isPasswordValid) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    const token = await auth.use('api').createToken(user)
    return token
  }
}
