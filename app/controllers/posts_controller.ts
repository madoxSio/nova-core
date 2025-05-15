import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'

export default class PostsController {
  /**
   * @index
   * @description Get all posts
   * @requestBody <Post>
   * @responseBody 200 - <Post>
   */
  public async index({ request, response }: HttpContext) {
    const { page = 1, limit = 10 } = request.only(['page', 'limit'])
    const posts = await Post.query().paginate(page, limit)
    return response.json(posts)
  }

  /**
   * @store
   * @description Create a new post
   * @requestBody <Post>
   * @responseBody 200 - <Post>
   */
  public async store({ auth, request, response }: HttpContext) {
    const { content } = request.only(['content'])
    const user = auth.getUserOrFail()

    const post = await Post.create({ content, userId: user.id })
    return response.json(post)
  }

  /**
   * @show
   * @description Get a post by id
   * @requestBody <Post>
   * @responseBody 200 - <Post>
   */
  public async show({ request, response }: HttpContext) {
    const { id } = request.params()

    if (Number.isNaN(+id)) {
      return response.badRequest({ message: 'Invalid post id' })
    }

    const post = await Post.find(id)
    return response.json(post)
  }

  /**
   * @update
   * @description Update a post by id
   * @requestBody <Post>
   * @responseBody 200 - <Post>
   */
  public async update({ request, response }: HttpContext) {
    const { id } = request.params()
    const { content } = request.only(['content'])

    if (Number.isNaN(+id)) {
      return response.badRequest({ message: 'Invalid post id' })
    }

    const post = await Post.find(id)

    if (!post) {
      return response.status(404).json({ message: 'Post not found' })
    }

    post.content = content
    await post.save()
    return response.json(post)
  }

  /**
   * @destroy
   * @description Delete a post by id
   * @requestBody <Post>
   * @responseBody 200 - <Post>
   */
  public async destroy({ request, response }: HttpContext) {
    const { id } = request.params()

    if (Number.isNaN(+id)) {
      return response.badRequest({ message: 'Invalid post id' })
    }

    const post = await Post.find(id)

    if (!post) {
      return response.status(404).json({ message: 'Post not found' })
    }

    await post.delete()
    return response.json({ message: 'Post deleted' })
  }

  /**
   * @like
   * @description Like a post by id
   * @requestBody <Post>
   * @responseBody 200 - <Post>
   */
  public async like({ request, response }: HttpContext) {
    const { id } = request.params()

    if (Number.isNaN(+id)) {
      return response.badRequest({ message: 'Invalid post id' })
    }

    const post = await Post.find(id)

    if (!post) {
      return response.status(404).json({ message: 'Post not found' })
    }

    post.likes++
    await post.save()
    return response.json(post)
  }
}
