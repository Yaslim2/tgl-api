import { promisify } from 'util'
import { randomBytes } from 'crypto'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import ForgotPassword from 'App/Validators/ForgotPasswordValidator'
import Mail from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'
import ResetPassword from 'App/Validators/ResetPasswordValidator'

export default class PasswordsController {
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email, resetPasswordUrl } = await request.validate(ForgotPassword)
    const user = await this.findUserByEmail(email)

    const random = await promisify(randomBytes)(24)
    const token = random.toString('hex')
    await user.related('tokens').updateOrCreate({ userId: user.id }, { token })

    const resetPasswordUrlWithToken = `${resetPasswordUrl}${
      resetPasswordUrl.slice(-1) === '/' ? '' : '/'
    }?token=${token}`

    await Mail.send((message) => {
      message
        .from('no-reply@tgl.com')
        .to(email)
        .subject('TGL - Recovery Password')
        .htmlView('email/forgotpassword', {
          name: user.username,
          resetPasswordUrl: resetPasswordUrlWithToken,
          company: 'TGL',
        })
    })
    return response.noContent()
  }

  public async resetPassword({ request, response }: HttpContextContract) {
    const { token, password } = await request.validate(ResetPassword)

    const userByToken = await User.query()
      .whereHas('tokens', (query) => {
        query.where('token', token)
      })
      .preload('tokens')
      .first()

    if (!userByToken) throw new BadRequest('The token that you tried to use are invalid.', 404)

    const tokenAge = Math.abs(userByToken.tokens[0].createdAt.diffNow('hours').hours)
    if (tokenAge > 2)
      throw new BadRequest(
        'The token that you tried to use already expired. Try again with a new one',
        410
      )

    userByToken.password = password
    await userByToken.tokens[0].delete()
    await userByToken.save()
    return response.noContent()
  }
  private async findUserByEmail(email: string) {
    const user = await User.findBy('email', email)
    if (!user)
      throw new BadRequest('User not found. Please insert a valid email and try again.', 404)
    return user
  }
}
