import Database from '@ioc:Adonis/Lucid/Database'
import { CartFactory, GameFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import Cart from 'App/Models/Cart'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

let token: string

test.group('Cart', (group) => {
  test('it should create a cart', async (assert) => {
    const cartPayload = {
      minValue: 25,
    }
    const { body } = await supertest(BASE_URL)
      .post('/admin/carts')
      .set('Authorization', `Bearer ${token}`)
      .send(cartPayload)
      .expect(201)

    assert.exists(body.cart, 'Cart undefined')
    assert.equal(body.cart.minValue, cartPayload.minValue)
  })

  test('it should return 422 when trying to create a cart with invalid data', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/admin/carts')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should update a cart', async (assert) => {
    const cart = await CartFactory.create()
    const cartPayload = {
      minValue: 55,
    }
    const { body } = await supertest(BASE_URL)
      .put(`/admin/carts/${cart.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(cartPayload)
      .expect(200)

    assert.exists(body.cart, 'Cart undefined')
    assert.equal(body.cart.id, cart.id)
    assert.equal(body.cart.minValue, cartPayload.minValue)
  })

  test('it should return 422 when providing invalid data to update a cart', async (assert) => {
    const cart = await CartFactory.create()
    const cartPayload = {
      minValue: 'oi',
    }
    const { body } = await supertest(BASE_URL)
      .put(`/admin/carts/${cart.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(cartPayload)
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should get a cart', async (assert) => {
    const cart = await CartFactory.create()
    const { body } = await supertest(BASE_URL)
      .get(`/carts/${cart.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.rules, 'Cart undefined')
    assert.equal(body.rules.id, cart.id)
    assert.equal(body.rules.minValue, cart.minValue)
    assert.equal(body.rules.types.length, 0)
  })

  test('it should return 404 when providing an invalid id to get a cart', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get(`/carts/58`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should delete a cart', async (assert) => {
    const cart = await CartFactory.create()
    await supertest(BASE_URL)
      .delete(`/admin/carts/${cart.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const carts = await Cart.query()

    assert.equal(carts.length, 1)
  })

  test('it should return 404 when trying to delete a cart with an invalid id', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .delete(`/admin/carts/5`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should add a existing game to an existing cart', async (assert) => {
    const game = await GameFactory.create()
    const cart = await CartFactory.create()

    const { body } = await supertest(BASE_URL)
      .post(`/admin/carts/${cart.id}/games/${game.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    assert.exists(body.cart, 'Cart undefined')
    assert.equal(body.cart.types.length, 1)
  })

  test('it should return 409 when trying to add a game that already exists on the cart', async (assert) => {
    const game = await GameFactory.create()
    const cart = await CartFactory.create()

    await supertest(BASE_URL)
      .post(`/admin/carts/${cart.id}/games/${game.id}`)
      .set('Authorization', `Bearer ${token}`)

    const { body } = await supertest(BASE_URL)
      .post(`/admin/carts/${cart.id}/games/${game.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 404 when providing an unexisting game id to add on the cart', async (assert) => {
    const cart = await CartFactory.create()

    const { body } = await supertest(BASE_URL)
      .post(`/admin/carts/${cart.id}/games/5`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should return 404 when providing an unexisting cart id to add on the cart', async (assert) => {
    const game = await GameFactory.create()
    const { body } = await supertest(BASE_URL)
      .post(`/admin/carts/8/games/${game.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should get all carts on the system', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get(`/admin/carts/all`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.carts, 'Carts undefined')
    assert.equal(body.carts.length, 1)
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
