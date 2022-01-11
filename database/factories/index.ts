import Factory from '@ioc:Adonis/Lucid/Factory'
import Game from 'App/Models/Game'
import User from 'App/Models/User'

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
}).build()

export const GameFactory = Factory.define(Game, ({ faker }) => {
  return {
    color: faker.internet.color(),
    range: faker.datatype.number(),
    price: faker.datatype.number(),
    description: faker.lorem.paragraph(),
    maxNumber: faker.datatype.number(),
    type: faker.company.companyName(),
  }
}).build()
