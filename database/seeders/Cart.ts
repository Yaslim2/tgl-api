import Cart from 'App/Models/Cart'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class CartSeeder extends BaseSeeder {
  public async run() {
    await Cart.create({
      minValue: 30,
    })
  }
}
