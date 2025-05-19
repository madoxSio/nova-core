import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'post_comments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('likes').defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('likes')
    })
  }
}
