import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import PostComment from '#models/post_comment'
import { createPostValidator } from '#validators/create_post'
import { createPostCommentValidator } from '#validators/create_post_comment'
import { v4 as uuid } from 'uuid'
import drive from '@adonisjs/drive/services/main'
import { readFile } from 'node:fs/promises'

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
   * @responseBody 201 - <Post>
   */
  public async store({ auth, request, response }: HttpContext) {
    const post = new Post()
    const user = auth.getUserOrFail()

    const { content, image } = await request.validateUsing(createPostValidator)

    post.fill({
      content: content,
      userId: user.id,
    })

    if (image) {
      const fileName = `${uuid()}.${image.extname}`
      const fileBuffer = await readFile(image.tmpPath!)
      await drive.use('s3').put(fileName, fileBuffer, {
        contentType: image.type,
        visibility: 'public',
      })

      post.image = await drive.use('s3').getUrl(fileName)
    }

    await post.save()
    return response.json(post)
  }

  /**
   * @show
   * @description Get a post by id
   * @responseBody 200 - <Post>.with(comments)
   */
  public async show({ request, response }: HttpContext) {
    const { id } = request.params()
    const post = await Post.find(id)

    const comments = await PostComment.query().where('post_id', id)

    const postWithComments = {
      ...post,
      comments,
    }

    return response.json(postWithComments)
  }

  /**
   * @destroy
   * @description Delete a post by id
   * @requestBody <Post>
   * @responseBody 200 - <Post>
   */
  public async destroy({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const { id } = request.params()
    const post = await Post.find(id)

    if (!post) {
      return response.status(404).json({ message: 'Post not found' })
    }

    if (post.userId !== user.id) {
      return response.status(403).json({ message: 'You are not authorized to delete this post' })
    }

    await post.delete()
    return response.json({ message: 'Post deleted' })
  }

  /**
   * @like
   * @summary Like a post by id
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
   * @summary Comment on a post by id
   * @description Comment on a post by id
   * @requestBody <createPostCommentValidator>
   * @responseBody 201 - <Post>
   */
  public async comment({ auth, request, response, logger }: HttpContext) {
    const { id } = request.params()
    const payload = await createPostCommentValidator.validate(request.only(['content']))
    const content = payload.content

    logger.info({ id, content }, 'Commenting on post')

    const post = await Post.find(id)

    if (!post) {
      return response.status(404).json({ message: 'Post not found' })
    }

    const comment = await PostComment.create({ content, postId: post.id, userId: auth.user?.id })
    return response.json(comment)
  }
}
