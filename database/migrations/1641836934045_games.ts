import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Games extends BaseSchema {
  protected tableName = 'games'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('cart_id')
        .unsigned()
        .references('id')
        .inTable('carts')
        .notNullable()
        .onDelete('CASCADE')
      table.string('type').notNullable().unique()
      table.string('description').notNullable()
      table.string('color').notNullable()
      table.integer('range').unsigned().notNullable()
      table.float('price').unsigned().notNullable()
      table.integer('max_number').unsigned().notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
