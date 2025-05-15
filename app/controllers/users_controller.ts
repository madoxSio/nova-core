import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  /**
   * @index
   * @description Get all users
   * @requestBody <User>
   * @responseBody 200 - <User>
   */
  public async index({ auth, request, response, logger }: HttpContext) {
    const { page, perPage } = request.only(['page', 'perPage'])
    const users = await User.query().paginate(page, perPage)
    logger.info({ auth: auth.user?.username }, 'Users fetched by')
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

  /**
   * @me
   * @summary Get the current user
   * @description Get the current user
   * @requestBody <User>
   * @responseBody 200 - <User>
   */
  public async me({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }

    return response.json(user)
  }
}
