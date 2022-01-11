import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Bet from 'App/Models/Bet'
import Cart from 'App/Models/Cart'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: string

  @column()
  public description: string

  @column()
  public range: number

  @column()
  public price: number

  @column({ serializeAs: 'maxNumber' })
  public maxNumber: number

  @column()
  public color: string

  @column({ serializeAs: null })
  public cartId: number

  @hasMany(() => Bet, {
    foreignKey: 'gameId',
  })
  public bets: HasMany<typeof Bet>

  @belongsTo(() => Cart, {
    foreignKey: 'cartId',
  })
  public cart: BelongsTo<typeof Cart>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
