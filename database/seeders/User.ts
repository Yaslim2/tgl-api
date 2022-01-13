import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.create({
      username: 'Yaslim',
      email: 'yaslim@yaslim.com',
      password: 'eu1234',
    })
  }
}
