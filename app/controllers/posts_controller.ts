import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import PostComment from '#models/post_comment'
import { createPostValidator } from '#validators/create_post'

export default class PostsController {
  /**
   * @index
   * @description Get all posts
   * @requestBody <Post>
   * @responseBody 200 - <Post[]>.with(relations).exclude(user)
   */
  public async index({ response, logger }: HttpContext) {
    const posts = await Post.query().preload('comments')
    logger.info(posts)
    return response.json(posts)
  }

  /**
   * @store
   * @description Create a new post
   * @requestBody <createPostValidator>
   * @responseBody 200 - <Post>
   */
  public async store({ auth, request, response }: HttpContext) {
    const payload = await createPostValidator.validate(request.only(['content']))
    const user = auth.getUserOrFail()

    const post = await Post.create({ content: payload.content, userId: user.id, likes: 0 })
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
    const post = await Post.find(id)

    if (!post) {
      return response.status(404).json({ message: 'Post not found' })
    }

    post.likes++
    await post.save()
    return response.json(post)
  }

  /**
   * @comment
   * @description Comment on a post by id
   * @requestBody <Post>
   * @responseBody 200 - <Post>
   */
  public async comment({ auth, request, response, logger }: HttpContext) {
    const { id } = request.params()
    const { content } = request.only(['content'])

    logger.info({ id, content }, 'Commenting on post')

    const post = await Post.find(id)

    if (!post) {
      return response.status(404).json({ message: 'Post not found' })
    }

    const comment = await PostComment.create({ content, postId: post.id, userId: auth.user?.id })
    return response.json(comment)
  }
}
