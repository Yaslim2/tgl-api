import { UserFactory } from 'Database/factories/index'
import Database from '@ioc:Adonis/Lucid/Database'

import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Session', (group) => {
  test('it should be able to authenticate a user', async (assert) => {
    const password = '123456'
    const { email, id } = await UserFactory.merge({ password }).create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email, password })
      .expect(201)

    assert.isDefined(body.user, 'User undefined')
    assert.equal(body.user.id, id)
  })

  test('it should authenticate an api token when a session is created', async (assert) => {
    const password = '123456'
    const { email, id } = await UserFactory.merge({ password }).create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email, password })
      .expect(201)

    assert.isDefined(body.token, 'Token undefined')
    assert.equal(body.user.id, id)
  })

  test('it should return 422 when credentials are not provided', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/sessions').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 400 when password are invalid', async (assert) => {
    const { email } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email, password: 'teste' })
      .expect(400)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 400)
    assert.equal(body.message, 'Invalid credentials')
  })

  test('it should return 400 when email are invalid', async (assert) => {
    const password = '123456'
    await UserFactory.merge({ password }).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email: 'teste@teste.com', password })
      .expect(400)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 400)
    assert.equal(body.message, 'Invalid credentials')
  })

  test('it should return 204 when user logout', async () => {
    const password = '123456'
    const { email } = await UserFactory.merge({ password }).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email, password })
      .expect(201)

    const token = body.token.token

    await supertest(BASE_URL)
      .delete('/sessions')
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  test('it should revoke the token when user logout', async (assert) => {
    const password = '123456'
    const { email } = await UserFactory.merge({ password }).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email, password })
      .expect(201)

    const token = body.token.token

    await supertest(BASE_URL)
      .delete('/sessions')
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const tokens = await Database.query().select('*').from('api_tokens')
    assert.isEmpty(tokens)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
