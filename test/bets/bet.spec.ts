import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail'
import { string } from '@ioc:Adonis/Core/Helpers'
import { UserFactory } from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'

import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

let token: string
let user = {} as User

test.group('Bets', (group) => {
  test('it should do a bet', async (assert) => {
    const games = [
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
    ]

    Mail.trap((message) => {
      assert.deepEqual(message.to, [{ address: user.email }])
      assert.deepEqual(message.from, { address: 'no-reply@tgl.com' })
      assert.include(message.html!, string.sentenceCase(user.username))
      assert.equal(message.subject, 'TGL - Your bets have been made!')
    })

    const { body } = await supertest(BASE_URL)
      .post('/bets/new-bet')
      .set('Authorization', `Bearer ${token}`)
      .send({ games })
      .expect(201)

    assert.exists(body.bets, 'Bets undefined')
    assert.equal(body.bets.length, 3)
    Mail.restore()
  })

  test('it should return 409 when providing less than the min cart value', async (assert) => {
    const games = [
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
    ]

    const { body } = await supertest(BASE_URL)
      .post('/bets/new-bet')
      .set('Authorization', `Bearer ${token}`)
      .send({ games })
      .expect(409)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 409 when providing a bet with less or more than the max number of the game', async (assert) => {
    const games = [
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6, 7],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
    ]

    const { body } = await supertest(BASE_URL)
      .post('/bets/new-bet')
      .set('Authorization', `Bearer ${token}`)
      .send({ games })
      .expect(409)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 409 when providing invalid numbers to the bets', async (assert) => {
    const games = [
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 0],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
    ]

    const { body } = await supertest(BASE_URL)
      .post('/bets/new-bet')
      .set('Authorization', `Bearer ${token}`)
      .send({ games })
      .expect(409)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 404 when providing an invalid game id to make a bet', async (assert) => {
    const games = [
      {
        gameId: 5,
        chosenNumbers: [1, 2, 3, 4, 5, 0],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
    ]

    const { body } = await supertest(BASE_URL)
      .post('/bets/new-bet')
      .set('Authorization', `Bearer ${token}`)
      .send({ games })
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should get a bet', async (assert) => {
    const games = [
      {
        gameId: 2,
        chosenNumbers: [1, 2, 4, 7, 8, 10],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 4, 5, 6],
      },
    ]

    Mail.trap(() => {})

    const response = await supertest(BASE_URL)
      .post('/bets/new-bet')
      .set('Authorization', `Bearer ${token}`)
      .send({ games })

    const betId = response.body.bets[0].id

    const { body } = await supertest(BASE_URL)
      .get(`/bets/${betId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.bet, 'Bet undefined')
    assert.equal(body.bet.id, 1)
    assert.equal(body.bet.chosenNumbers, games[0].chosenNumbers.join(', '))
    Mail.restore()
  })

  test('it should return 404 when providing an invalid id for get a bet', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get('/bets/85')
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  group.before(async () => {
    const password = '123456'
    const newUser = await UserFactory.merge({ password, isAdmin: true }).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email: newUser.email, password })

    user = newUser
    token = body.token.token
  })

  group.after(async () => {
    await supertest(BASE_URL).delete('/users').set('Authorization', `Bearer ${token}`)
    await supertest(BASE_URL).delete('/sessions').set('Authorization', `Bearer ${token}`)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
