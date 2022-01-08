import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { Exception } from '@adonisjs/core/build/standalone'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: Exception, ctx: HttpContextContract) {
    if (error.status === 422) {
      return ctx.response.status(error.status).send({
        code: 'BAD_REQUEST',
        message: error.message,
        status: error.status,
        errors: error['messages']?.errors ? error['messages'].errors : [],
      })
    } else if (['E_INVALID_AUTH_UID', 'E_INVALID_AUTH_PASSWORD'].includes(error.code || '')) {
      return ctx.response.status(error.status).send({
        code: 'BAD_REQUEST',
        message: 'invalid credentials',
        status: error.status,
      })
    } else if (error.code === 'E_UNAUTHORIZED_ACCESS') {
      return ctx.response.status(error.status).send({
        code: 'BAD_REQUEST',
        message: 'unauthorized access',
        status: error.status,
      })
    } else if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(error.status).send({
        code: 'BAD_REQUEST',
        message: 'route not found',
        status: error.status,
      })
    } else if (error.code === 'E_AUTHORIZATION_FAILURE') {
      return ctx.response.status(error.status).send({
        code: 'BAD_REQUEST',
        message: 'not authorized to perform this action',
        status: error.status,
      })
    } else if (error.code === 'E_ROW_NOT_FOUND') {
      return ctx.response.status(error.status).send({
        code: 'BAD_REQUEST',
        message: 'resource not found',
        status: error.status,
      })
    }
    return super.handle(error, ctx)
  }
}
