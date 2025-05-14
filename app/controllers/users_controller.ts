import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  /**
   * @index
   * @description Get all users
   * @requestBody <User>
   * @responseBody 200 - <User>
   */
  public async index({ request, response }: HttpContext) {
    const { page, perPage } = request.only(['page', 'perPage'])
    const users = await User.query().paginate(page, perPage)
    return response.json(users)
  }

  /**
   * @show
   * @description Get a user by id
   * @requestBody <User>
   * @responseBody 200 - <User>
   */
  public async show({ request, response }: HttpContext) {
    const { id } = request.params()
    const user = await User.find(id)

    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    return response.json(user)
  }
}
