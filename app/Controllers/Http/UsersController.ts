import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const userPayload = await request.validate(CreateUser)

    const usernameAlreadyExists = await User.findBy('username', userPayload.username)
    if (usernameAlreadyExists) throw new BadRequest('username already in use', 409)

    const emailAlreadyExists = await User.findBy('email', userPayload.email)
    if (emailAlreadyExists) throw new BadRequest('email already in use', 409)

    const user = await User.create(userPayload)

    return response.created({ user })
  }

  public async update({ request, response }: HttpContextContract) {
    return response.ok({})
  }
}
