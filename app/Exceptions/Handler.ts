import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { string } from '@ioc:Adonis/Core/Helpers'
import { Exception } from '@adonisjs/core/build/standalone'
import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {
  private code = 'BAD_REQUEST'
  constructor() {
    super(Logger)
  }

  public async handle(error: Exception, ctx: HttpContextContract) {
    if (error.status === 422) {
      return ctx.response.status(error.status).send({
        code: this.code,
        message: error.message,
        status: error.status,
        errors: error['messages']?.errors ? error['messages'].errors : [],
      })
    } else if (['E_INVALID_AUTH_UID', 'E_INVALID_AUTH_PASSWORD'].includes(error.code || '')) {
      return ctx.response.status(error.status).send({
        code: this.code,
        message: 'invalid credentials. check your credentials and try again.',
        status: error.status,
      })
    } else if (error.code === 'E_UNAUTHORIZED_ACCESS') {
      return ctx.response.status(error.status).send({
        code: this.code,
        message: 'unauthorized access. you are not allowed to access this resource',
        status: error.status,
      })
    } else if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(error.status).send({
        code: this.code,
        message: string.sentenceCase('the route that you tried to access was not found'),
        status: error.status,
      })
    } else if (error.code === 'E_ROW_NOT_FOUND') {
      return ctx.response.status(error.status).send({
        code: this.code,
        message: string.sentenceCase('the resource that you tried to access was not found'),
        status: error.status,
      })
    }
    return super.handle(error, ctx)
  }
}
