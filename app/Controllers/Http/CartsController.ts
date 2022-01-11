import Cart from 'App/Models/Cart'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import CreateCart from 'App/Validators/CreateCartValidator'
import UpdateCart from 'App/Validators/UpdateCartValidator'

export default class CartsController {
  public async index({ response, request }: HttpContextContract) {
    const { id } = request.qs()
    const rules = await this.findAndFormatCartRules(+id)
    return response.ok({ rules })
  }

  public async indexAll({ response }: HttpContextContract) {
    const carts = await this.findAndFormatAllCartRules()
    return response.ok({ carts })
  }

  public async store({ response, request }: HttpContextContract) {
    const { minValue } = await request.validate(CreateCart)

    const cart = await Cart.create({ minValue })

    return response.created({ cart })
  }

  public async destroy({ response, request }: HttpContextContract) {
    const id = request.param('id')
    const cart = await this.findCart(id)
    await cart.delete()
    return response.noContent()
  }

  public async update({ response, request }: HttpContextContract) {
    const { minValue } = await request.validate(UpdateCart)
    const id = request.param('id')
    const cart = await this.findCart(id)

    cart.minValue = minValue

    await cart.save()
    await cart.refresh()

    return response.ok({ cart })
  }

  private async findCart(id: number) {
    const cart = await Cart.find(id)
    if (!cart)
      throw new BadRequest('cart not found. please insert a valid cart id and try again', 404)
    return cart
  }

  private async findAndFormatCartRules(id: number) {
    if (!id) id = 1
    const rules = await Cart.query()
      .select('minValue', 'id')
      .where('id', id)
      .preload('types', (query) => {
        query.select('id', 'type', 'description', 'range', 'color', 'price', 'maxNumber')
      })
      .first()

    if (!rules)
      throw new BadRequest('cart not found. please insert a valid cart id and try again', 404)
    return rules
  }

  private async findAndFormatAllCartRules() {
    const rules = await Cart.query()
      .select('minValue', 'id')
      .preload('types', (query) => {
        query.select('id', 'type', 'description', 'range', 'color', 'price', 'maxNumber')
      })
    return rules
  }
}
