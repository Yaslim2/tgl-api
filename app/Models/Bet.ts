import User from 'App/Models/User'
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Game from './Game'

export default class Bet extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'userId' })
  public userId: number

  @column({ serializeAs: 'gameId' })
  public gameId: number

  @column({ serializeAs: 'chosenNumbers' })
  public chosenNumbers: string

  @column()
  public price: number

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Game, {
    foreignKey: 'gameId',
  })
  public game: BelongsTo<typeof Game>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
