import Cart from 'App/Models/Cart'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import CreateCart from 'App/Validators/CreateCartValidator'
import UpdateCart from 'App/Validators/UpdateCartValidator'
import Game from 'App/Models/Game'

export default class CartsController {
  public async index({ response, request }: HttpContextContract) {
    const id = request.param('id')
    const rules = await this.findAndFormatCartRules(id)
    return response.ok({ rules })
  }

  public async indexAll({ response }: HttpContextContract) {
    const carts = await this.findAndFormatAllCartRules()
    return response.ok({ carts })
  }

  public async addGame({ request, response }: HttpContextContract) {
    const cartId = request.param('cartId')
    const gameId = request.param('gameId')

    const cart = await this.findCart(cartId)
    const game = await this.findGame(gameId)

    await cart.load('types')
    const existingGame = cart.types.find((cartGame) => cartGame.id === game.id)
    if (existingGame)
      throw new BadRequest('The game you tried to add already exists in the cart.', 409)

    game.cartId = cartId

    await game.save()
    await game.refresh()
    await cart.refresh()

    const formatedCart = await this.findAndFormatCartRules(cartId)
    return response.created({ cart: formatedCart })
  }

  public async store({ response, request }: HttpContextContract) {
    const { minValue } = await request.validate(CreateCart)

    const cart = await Cart.create({ minValue })

    return response.created({ cart })
  }

  public async destroy({ response, request }: HttpContextContract) {
    const id = request.param('id')
    const cart = await this.findCart(id)
    await cart.delete()
    return response.noContent()
  }

  public async update({ response, request }: HttpContextContract) {
    const { minValue } = await request.validate(UpdateCart)
    const id = request.param('id')
    const cart = await this.findCart(id)

    cart.minValue = minValue

    await cart.save()
    await cart.refresh()

    return response.ok({ cart })
  }

  private async findCart(id: number) {
    const cart = await Cart.find(id)
    if (!cart)
      throw new BadRequest('Cart not found. Please insert a valid cart id and try again', 404)
    return cart
  }

  private async findGame(id: number) {
    const game = await Game.find(id)
    if (!game)
      throw new BadRequest('Game not found. Please insert a valid game id and try again', 404)
    return game
  }

  private async findAndFormatCartRules(id: number) {
    if (!id) id = 1
    const rules = await Cart.query()
      .select('minValue', 'id')
      .where('id', id)
      .preload('types', (query) => {
        query.select('id', 'type', 'description', 'range', 'color', 'price', 'maxNumber')
      })
      .first()

    if (!rules)
      throw new BadRequest('Cart not found. Please insert a valid cart id and try again', 404)
    return rules
  }

  private async findAndFormatAllCartRules() {
    const rules = await Cart.query()
      .select('minValue', 'id')
      .preload('types', (query) => {
        query.select('id', 'type', 'description', 'range', 'color', 'price', 'maxNumber')
      })
    return rules
  }
}
