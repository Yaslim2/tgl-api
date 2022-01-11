import Database from '@ioc:Adonis/Lucid/Database'
import { GameFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import Game from 'App/Models/Game'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

let token: string
const cartId = 1
test.group('Game', (group) => {
  test('it should get all games avaiables on the cart (default 1)', async (assert) => {
    const { body } = await supertest(BASE_URL).get(`/carts/${cartId}`).expect(200)
    assert.exists(body.rules, 'Games undefined')
    assert.equal(body.rules.minValue, 30)
    assert.equal(body.rules.types.length, 3)
  })

  test('it should create a game', async (assert) => {
    const gamePayload = {
      type: 'telesena',
      description:
        'Escolha 15 números para apostar na lotofácil. Você ganha acertando 11, 12, 13, 14 ou 15 números. São muitas chances de ganhar, e agora você joga de onde estiver!',
      range: 25,
      price: 2.5,
      maxNumber: 15,
      color: '#7F3992',
    }

    const { body } = await supertest(BASE_URL)
      .post('/admin/games')
      .set('Authorization', `Bearer ${token}`)
      .send(gamePayload)
      .expect(201)
    assert.exists(body.game, 'Game not exists')
    assert.equal(body.game.type, gamePayload.type)
  })

  test('it should return 409 when trying to create a game with an existing name (type)', async (assert) => {
    const gamePayload = {
      type: 'telesena',
      description:
        'Escolha 15 números para apostar na lotofácil. Você ganha acertando 11, 12, 13, 14 ou 15 números. São muitas chances de ganhar, e agora você joga de onde estiver!',
      range: 25,
      price: 2.5,
      maxNumber: 15,
      color: '#7F3992',
    }

    await GameFactory.merge({ type: gamePayload.type }).create()

    const { body } = await supertest(BASE_URL)
      .post('/admin/games')
      .set('Authorization', `Bearer ${token}`)
      .send(gamePayload)
      .expect(409)

    assert.exists(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 422 when not providing required data for creating a game', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/admin/games')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should get an game', async (assert) => {
    const game = await GameFactory.create()
    const { body } = await supertest(BASE_URL)
      .get(`/admin/games/${game.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.game, 'Game undefined')
    assert.equal(body.game.id, game.id)
  })

  test('it should return 404 when providing an invalid id to get a game', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get(`/admin/games/123`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should update a game', async (assert) => {
    const game = await GameFactory.create()
    const gamePayload = {
      type: 'telesena',
      description:
        'Escolha 15 números para apostar na lotofácil. Você ganha acertando 11, 12, 13, 14 ou 15 números. São muitas chances de ganhar, e agora você joga de onde estiver!',
      range: 25,
      price: 2.5,
      maxNumber: 15,
      color: '#7F3992',
    }

    const { body } = await supertest(BASE_URL)
      .put(`/admin/games/${game.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(gamePayload)
      .expect(200)
    assert.exists(body.game, 'Game undefined')
    assert.equal(body.game.id, game.id)
    assert.equal(body.game.type, gamePayload.type)
    assert.equal(body.game.description, gamePayload.description)
    assert.equal(body.game.price, gamePayload.price)
    assert.equal(body.game.maxNumber, gamePayload.maxNumber)
    assert.equal(body.game.color, gamePayload.color)
  })

  test('it should return 409 when trying to update an game with an existing name (type)', async (assert) => {
    const gamePayload = {
      type: 'telesena',
      description:
        'Escolha 15 números para apostar na lotofácil. Você ganha acertando 11, 12, 13, 14 ou 15 números. São muitas chances de ganhar, e agora você joga de onde estiver!',
      range: 25,
      price: 2.5,
      maxNumber: 15,
      color: '#7F3992',
    }

    await GameFactory.merge({ type: gamePayload.type }).create()

    const { body } = await supertest(BASE_URL)
      .post(`/admin/games`)
      .set('Authorization', `Bearer ${token}`)
      .send(gamePayload)
      .expect(409)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 422 when trying not providing required data to update a game', async (assert) => {
    const game = await GameFactory.create()

    const { body } = await supertest(BASE_URL)
      .put(`/admin/games/${game.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 404 when providing an invalid id to update a game', async (assert) => {
    const gamePayload = {
      type: 'telesena',
      description:
        'Escolha 15 números para apostar na lotofácil. Você ganha acertando 11, 12, 13, 14 ou 15 números. São muitas chances de ganhar, e agora você joga de onde estiver!',
      range: 25,
      price: 2.5,
      maxNumber: 15,
      color: '#7F3992',
    }
    const { body } = await supertest(BASE_URL)
      .put(`/admin/games/52`)
      .set('Authorization', `Bearer ${token}`)
      .send(gamePayload)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should delete a game', async (assert) => {
    const game = await GameFactory.create()
    await supertest(BASE_URL)
      .delete(`/admin/games/${game.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const games = await Game.query()
    assert.equal(games.length, 3)
  })

  test('it should return 404 when providing an invalid id for delete a game', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .delete(`/admin/games/52`)
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
