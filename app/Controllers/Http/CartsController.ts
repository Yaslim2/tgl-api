import Cart from 'App/Models/Cart'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CartsController {
  public async getRules({ response }: HttpContextContract) {
    const rules = await Cart.query().select('minValue', 'id').firstOrFail()
    await rules.load('types')
    console.log({ rules: JSON.stringify(rules) })
    return response.ok({ rules })
  }
}
