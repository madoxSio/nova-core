import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  public async register({ request, response }: HttpContext) {
    const data = request.only(['email', 'password'])

    const user = await User.create(data)
    return response.created({ user })
  }

  public async login({ request, auth, response }: HttpContext) {
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
