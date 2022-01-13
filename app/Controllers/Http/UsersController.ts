import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { HasMany } from '@ioc:Adonis/Lucid/Orm'
import { string } from '@ioc:Adonis/Core/Helpers'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import Bet from 'App/Models/Bet'
import CreateUser from 'App/Validators/CreateUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'
import Mail from '@ioc:Adonis/Addons/Mail'

type IUserPayloadType = {
  username: string
  email: string
  password: string
}

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const userPayload = await request.validate(CreateUser)

    await this.validateUser(userPayload)

    let isAdmin = false
    if (userPayload.email.includes('@luby')) isAdmin = true

    const user = await User.create({ ...userPayload, isAdmin })

    await Mail.send((message) => {
      message
        .from('no-reply@tgl.com')
        .to(user.email)
        .subject(`TGL - Welcome ${string.sentenceCase(user.username)}`)
        .htmlView('welcome/welcome', {
          name: string.sentenceCase(user.username),
          company: 'TGL',
          companyEmail: 'no-reply@tgl.com',
          companyAddress: '208, 699 Street',
        })
    })

    return response.created({ user })
  }

  public async update({ request, response, auth }: HttpContextContract) {
    const userPayload = await request.validate(UpdateUser)
    const { id } = await auth.use('api').authenticate()

    const user = await this.findUser(id)
    await this.validateUser(userPayload, id)

    user.email = userPayload.email
    user.password = userPayload.password
    user.username = userPayload.username

    await user.save()
    await user.refresh()
    return response.ok({ user })
  }

  public async index({ response, auth }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    const user = await this.findUser(id)
    await user.load('bets')
    const betsFiltered = await this.getFilteredBets(user.bets)
    return response.ok({ user, bets: betsFiltered })
  }

  public async destroy({ auth, response }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()

    const user = await this.findUser(id)

    await user.delete()
    return response.noContent()
  }

  private async findUser(id: number) {
    const user = await User.find(id)
    if (!user)
      throw new BadRequest('user not found. please insert a valid user id and try again.', 404)
    return user
  }

  private async validateUser(userPayload: IUserPayloadType, id: number = -1) {
    const usernameAlreadyExists = await User.findBy('username', userPayload.username)
    if (
      (usernameAlreadyExists && id === -1) ||
      (usernameAlreadyExists && usernameAlreadyExists.id !== id)
    )
      throw new BadRequest(
        'username already in use in the system. try again with another username',
        409
      )

    const emailAlreadyExists = await User.findBy('email', userPayload.email)
    if ((emailAlreadyExists && id === -1) || (emailAlreadyExists && emailAlreadyExists.id !== id))
      throw new BadRequest('email already in use in the system. try again with another email', 409)
  }

  private async getFilteredBets(bets: HasMany<typeof Bet>) {
    const betsFiltered = bets.filter((bet) => {
      const betAge = Math.abs(bet.createdAt.diffNow('days').days)
      return betAge <= 30
    })
    return betsFiltered
  }
}
