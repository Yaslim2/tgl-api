import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'

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
    return response.ok({ user })
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
}
