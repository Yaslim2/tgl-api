import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Game from 'App/Models/Game'

export default class Cart extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'minValue' })
  public minValue: number

  @hasMany(() => Game, {
    foreignKey: 'cartId',
  })
  public types: HasMany<typeof Game>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
