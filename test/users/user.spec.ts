import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('User', (group) => {
  test.only('it should create an user', async (assert) => {
    const userPayload = {
      username: 'yaslim',
      email: 'yaslim@yaslim.com',
      password: '1234',
    }
    const { body } = await supertest(BASE_URL).post('/users').send(userPayload).expect(201)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.username, userPayload.username)
    assert.exists(body.user.email, userPayload.email)
    assert.notExists(body.user.password, 'Password defined on the body')
  })

  test('it should return 422 when providing no data to create an user', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/users').send({}).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
    assert.notEqual(body.errors.length, 0)
  })

  test('it should return 422 when providing an invalid email to create an user', async (assert) => {
    const userPayload = {
      username: 'yaslim',
      email: '123@',
      password: '1234',
    }
    const { body } = await supertest(BASE_URL).post('/users').send(userPayload).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
    assert.equal(body.errors[0].field, 'email')
  })

  test('it should return 422 when providing an invalid password to create an user', async (assert) => {
    const userPayload = {
      username: 'yaslim',
      email: 'yaslim@yaslim.com',
      password: '123',
    }
    const { body } = await supertest(BASE_URL).post('/users').send(userPayload).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
    assert.equal(body.errors[0].field, 'password')
  })

  test('it should return 409 when trying to create an user with an existing email', async (assert) => {
    const userPayload = {
      username: 'yaslim',
      email: 'yaslim@yaslim.com',
      password: '1234',
    }
    await supertest(BASE_URL).post('/users').send(userPayload).expect(201)
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({ ...userPayload, username: 'lucas' })
      .expect(409)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
    assert.equal(body.message, 'email already in use')
  })

  test('it should return 409 when trying to create an user with an existing username', async (assert) => {
    const userPayload = {
      username: 'yaslim',
      email: 'yaslim@yaslim.com',
      password: '1234',
    }
    await supertest(BASE_URL).post('/users').send(userPayload).expect(201)
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({ ...userPayload, email: 'teste@teste.com' })
      .expect(409)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
    assert.equal(body.message, 'username already in use')
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
