import Cart from 'App/Models/Cart'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Game from 'App/Models/Game'
import BadRequest from 'App/Exceptions/BadRequestException'
import CreateGame from 'App/Validators/CreateGameValidator'
import UpdateGame from 'App/Validators/UpdateGameValidator'

export default class GamesController {
  public async index({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const game = await this.findGame(id)
    return response.ok({ game })
  }

  public async store({ request, response }: HttpContextContract) {
    const gamePayload = await request.validate(CreateGame)
    if (gamePayload.cartId) await this.validateCart(gamePayload.cartId)
    await this.validateCreateGame(gamePayload.type)
    const game = await Game.create(gamePayload)
    return response.created({ game })
  }

  public async update({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const { color, description, maxNumber, price, range, type } = await request.validate(UpdateGame)
    const game = await this.findGame(id)
    await this.validateUpdateGame(game, type)

    game.maxNumber = maxNumber
    game.color = color
    game.description = description
    game.price = price
    game.range = range
    game.type = type

    await game.save()
    await game.refresh()
    return response.ok({ game })
  }

  public async destroy({ request, response }: HttpContextContract) {
    const id = request.param('id')

    const game = await this.findGame(id)

    await game.delete()

    return response.noContent()
  }

  private async validateCart(id: number) {
    const cart = await Cart.find(id)
    if (!cart)
      throw new BadRequest('Cart not found. Please insert a valid cart id and try again', 404)
  }

  private async findGame(id: number) {
    const game = await Game.find(id)
    if (!game)
      throw new BadRequest('Game not found. Please insert a valid game id and try again', 404)
    return game
  }

  private async validateUpdateGame(game: Game, type: string) {
    const existingGame = await Game.findBy('type', type)
    if (existingGame && existingGame.type === type && existingGame.id !== game.id)
      throw new BadRequest(
        'Game type already exists. Please insert a valid game type and try again.',
        409
      )
  }

  private async validateCreateGame(type: string) {
    const existingGame = await Game.findBy('type', type)
    if (existingGame)
      throw new BadRequest(
        'Game type already exists. Please insert a valid game type and try again.',
        409
      )
  }
}
