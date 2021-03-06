import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
export default class AdminVerifier {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    const { isAdmin } = auth.user!
    if (!isAdmin) {
      throw new BadRequest(
        'You have no permission to perform this action. Only admins can do those actions',
        403
      )
    }
    await next()
  }
}
