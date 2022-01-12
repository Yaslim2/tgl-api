import Bet from 'App/Models/Bet'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import { HasMany } from '@ioc:Adonis/Lucid/Orm'

export default class AdminsController {
  public async index({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const user = await this.findUser(id)

    await user.load('bets')
    const betsFiltered = await this.getFilteredBets(user.bets)
    return response.ok({ user, bets: betsFiltered })
  }

  public async indexAll({ response }: HttpContextContract) {
    const users = await User.query()
    return response.ok({ users })
  }

  public async destroy({ response, request }: HttpContextContract) {
    const id = request.param('id')
    const user = await this.findUser(id)
    await user.delete()
    return response.noContent()
  }

  public async promoteUser({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const user = await this.findUser(id)

    if (user.isAdmin)
      throw new BadRequest('the user that you are trying to promote already is a admin', 409)

    user.isAdmin = true
    return response.ok({ user })
  }

  public async downgradeUser({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const user = await this.findUser(id)

    if (!user.isAdmin)
      throw new BadRequest(
        'the user that you are trying to downgrade already is a normal user',
        409
      )

    user.isAdmin = false
    return response.ok({ user })
  }

  private async findUser(id: number) {
    const user = await User.find(id)
    if (!user)
      throw new BadRequest('user not found. please provide a valid user id and try again.', 404)
    return user
  }

  private async getFilteredBets(bets: HasMany<typeof Bet>) {
    const betsFiltered = bets.filter((bet) => {
      const betAge = Math.abs(bet.createdAt.diffNow('days').days)
      return betAge < 30
    })
    return betsFiltered
  }
}
