import BadRequest from 'App/Exceptions/BadRequestException'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Game from 'App/Models/Game'
import CreateBet from 'App/Validators/CreateBetValidator'
import Bet from 'App/Models/Bet'
import Cart from 'App/Models/Cart'

type IBets = {
  chosenNumbers: string
  gameId: number
  price: number
  userId: number
}

export default class BetsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    let { games, cartId } = await request.validate(CreateBet)

    if (!cartId) cartId = 1
    const cart = await this.findCart(cartId)
    const betsToMake: IBets[] = []

    const prices = games.map(async ({ chosenNumbers, gameId }) => {
      chosenNumbers.sort((a: number, b: number) => a - b)
      const game = await this.findGame(gameId)
      if (game.maxNumber !== chosenNumbers.length)
        throw new BadRequest(
          `for make a bet to ${game.type} you need to provide exactly ${game.maxNumber} numbers.`,
          409
        )

      chosenNumbers.forEach((number) => {
        if (number > game.range || number === 0)
          throw new BadRequest(
            `invalid numbers to the bet. please provide numbers between 1 and ${game.range}.`,
            409
          )
      })
      betsToMake.push({
        chosenNumbers: chosenNumbers.join(', '),
        gameId,
        price: game.price,
        userId: id,
      })
      return game.price
    })

    const allPrices = await Promise.all(prices)

    const totalPrice = allPrices.reduce((ac, val) => ac + val)
    if (totalPrice < cart.minValue)
      throw new BadRequest(
        `you need to provide at least ${totalPrice.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        })} to make a game`,
        409
      )

    const bets = await Bet.createMany(betsToMake)
    return response.created({ bets })
  }
  public async index({ request, response, auth, bouncer }: HttpContextContract) {
    const id = request.param('id')
    const user = await auth.use('api').authenticate()
    await bouncer.authorize('getBet', user)
    const bet = await this.findBet(id)
    return response.ok({ bet })
  }

  private async findBet(id: number) {
    const bet = await Bet.find(id)
    if (!bet)
      throw new BadRequest('bet not found. please provide a valid bet id and try again.', 404)
    return bet
  }

  private async findGame(id: number) {
    const game = await Game.find(id)
    if (!game)
      throw new BadRequest('game not found. please provide a valid game id and try again.', 404)
    return game
  }

  private async findCart(id: number) {
    const cart = await Cart.find(id)
    if (!cart)
      throw new BadRequest('cart not found. please provide a valid cart id and try again.', 404)
    return cart
  }
}
