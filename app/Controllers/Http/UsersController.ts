import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const userPayload = await request.validate(CreateUser)

    const usernameAlreadyExists = await User.findBy('username', userPayload.username)
    if (usernameAlreadyExists) throw new BadRequest('username already in use', 409)

    const emailAlreadyExists = await User.findBy('email', userPayload.email)
    if (emailAlreadyExists) throw new BadRequest('email already in use', 409)

    let isAdmin = 0
    if (userPayload.email.includes('@luby')) isAdmin = 1

    const user = await User.create({ ...userPayload, isAdmin })

    return response.created({ user })
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const { email, password, username } = await request.validate(UpdateUser)
    const id = request.param('id')
    const user = await this.findUser(id)

    await bouncer.with('UserPolicy').authorize('update', user)

    user.email = email
    user.password = password
    user.username = username

    await user.save()
    await user.refresh()
    return response.ok({ user })
  }

  public async index({ request, response, bouncer }: HttpContextContract) {
    const id = request.param('id')
    const user = await this.findUser(id)

    if (!user.isAdmin) await bouncer.with('UserPolicy').authorize('view', user)

    return response.ok({ user })
  }

  public async indexAll({ response, bouncer }: HttpContextContract) {
    await bouncer.with('UserPolicy').authorize('viewAll')
    const users = await User.query()
    return response.ok({ users })
  }

  public async destroy({ request, response, bouncer }: HttpContextContract) {
    const id = request.param('id')

    const user = await this.findUser(id)

    if (!user.isAdmin) await bouncer.with('UserPolicy').authorize('destroy', user)

    await user.delete()
    return response.noContent()
  }

  private async findUser(id: number) {
    const user = await User.find(id)
    if (!user) throw new BadRequest('user not found', 404)
    return user
  }
}
