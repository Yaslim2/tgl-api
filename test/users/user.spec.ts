import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let user = {} as User
let token = ''
test.group('User', (group) => {
  test('it should create an user', async (assert) => {
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
    assert.equal(body.message, 'Email already in use')
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
    assert.equal(body.message, 'Username already in use')
  })

  test('it should update an user', async (assert) => {
    const userPayload = {
      email: 'teste@teste.com',
      username: 'teste',
      password: 'teste123',
    }
    const { body } = await supertest(BASE_URL)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(userPayload)
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.email, userPayload.email)
    assert.equal(body.user.username, userPayload.username)
    assert.equal(body.user.id, user.id)
  })

  test('it should return 404 when providing an invalid id', async (assert) => {
    const userPayload = {
      email: 'teste@teste.com',
      username: 'teste',
      password: 'teste123',
    }
    const { body } = await supertest(BASE_URL)
      .put(`/users/123`)
      .set('Authorization', `Bearer ${token}`)
      .send(userPayload)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
    assert.equal(body.message, 'User not found')
  })

  test('it should get an user by id', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.id, user.id)
  })

  test('it should get all users (if you are admin)', async (assert) => {
    const password = '123456'
    const email = 'yaslim@luby.com'
    const newUser = await UserFactory.merge({ password, email, isAdmin: 1 }).create()

    const response = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email: newUser.email, password })

    const newToken = response.body.token.token

    const { body } = await supertest(BASE_URL)
      .get(`/users`)
      .set('Authorization', `Bearer ${newToken}`)
      .expect(200)

    assert.exists(body.users, 'Users undefined')
    assert.equal(body.users.length, 2)
    assert.equal(body.users[0].id, user.id)
    assert.equal(body.users[1].id, newUser.id)
  })

  test('it should delete an user', async (assert) => {
    await supertest(BASE_URL)
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const users = await Database.query().select('*').from('users')
    assert.isEmpty(users, 'Users not empty')
  })

  test.only('it should return 403 if you are trying to get all users and you are not an admin', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get(`/users`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 403)
  })

  group.before(async () => {
    const password = '123456'
    const newUser = await UserFactory.merge({ password }).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email: newUser.email, password })

    token = body.token.token
    user = newUser
  })

  group.after(async () => {
    await supertest(BASE_URL).delete('/sessions').set('Authorization', `Bearer ${token}`)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
