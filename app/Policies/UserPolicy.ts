import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export default class UserPolicy extends BasePolicy {
  public async view(actualUser: User, user: User) {
    return actualUser.id === user.id
  }
  public async update(actualUser: User, user: User) {
    return actualUser.id === user.id
  }
  public async destroy(actualUser: User, user: User) {
    return actualUser.id === user.id
  }
  public async viewAll(actualUser: User, isAdmin: number = 1) {
    return actualUser.isAdmin === isAdmin
  }
}
