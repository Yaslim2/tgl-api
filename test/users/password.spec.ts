import { DateTime, Duration } from 'luxon'
import { UserFactory } from 'Database/factories/index'
import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'
import Mail from '@ioc:Adonis/Addons/Mail'
import Hash from '@ioc:Adonis/Core/Hash'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Password', (group) => {
  test('it should send an email with the forgot password instructions', async (assert) => {
    const user = await UserFactory.create()
    Mail.trap((message) => {
      assert.deepEqual(message.to, [{ address: user.email }])
      assert.deepEqual(message.from, { address: 'no-reply@tgl.com' })
      assert.include(message.html!, user.username)
      assert.equal(message.subject, 'TGL - Recovery Password')
    })

    await supertest(BASE_URL)
      .post('/forgot-password')
      .send({ email: user.email, resetPasswordUrl: 'http://yaslim.com' })
      .expect(204)

    Mail.restore()
  })

  test('it should create a reset password token', async (assert) => {
    const user = await UserFactory.create()
    Mail.trap(() => {})

    await supertest(BASE_URL)
      .post('/forgot-password')
      .send({ email: user.email, resetPasswordUrl: 'http://yaslim.com' })
      .expect(204)

    await user.refresh()
    const tokens = await user.related('tokens').query()

    assert.equal(tokens.length, 1)
    Mail.restore()
  })

  test('it should return 422 when required data is not provided or is invalid on forgot password', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/forgot-password').send({}).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 404 when providing an email who is not listed', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/forgot-password')
      .send({ email: 'teste@teste.com', resetPasswordUrl: 'http://yaslim.com' })
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should be able to reset the password', async (assert) => {
    const password = '12345678'
    const user = await UserFactory.create()
    const { token } = await user.related('tokens').create({ token: 'token' })

    await supertest(BASE_URL).post('/reset-password').send({ token, password }).expect(204)

    await user.refresh()

    const checkPassword = await Hash.verify(user.password, password)
    assert.isTrue(checkPassword, 'Invalid password')

    await user.load('tokens')
    assert.isEmpty(user.tokens)
  })

  test('it should return 422 when not providing data to reset the password', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/reset-password').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when providing an token that not exists', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/reset-password')
      .send({ token: '587', password: '145874' })
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when trying to use the same token twice', async (assert) => {
    const password = '12345678'
    const user = await UserFactory.create()
    const { token } = await user.related('tokens').create({ token: 'token' })

    await supertest(BASE_URL).post('/reset-password').send({ token, password }).expect(204)
    const { body } = await supertest(BASE_URL)
      .post('/reset-password')
      .send({ token, password })
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it cannot reset the password with a token who is expired after 2 hours', async (assert) => {
    const password = '12345678'
    const user = await UserFactory.create()
    const date = DateTime.now().minus(Duration.fromISOTime('02:01'))
    const { token } = await user.related('tokens').create({ token: 'token', createdAt: date })

    const { body } = await supertest(BASE_URL)
      .post('/reset-password')
      .send({ token, password })
      .expect(410)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 410)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
