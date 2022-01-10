import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Game', (group) => {
  test.only('it should get all games avaiables on the cart', async (assert) => {
    const { body } = await supertest(BASE_URL).get('/games').expect(200)
    assert.exists(body.games, 'Games dont exists')
  })
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
