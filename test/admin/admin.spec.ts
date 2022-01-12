import { UserFactory } from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'

import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/User'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

let token: string
let user = {} as User

test.group('Admin', (group) => {
  test('it should get a user and his bets', async (assert) => {
    const games = [
      {
        gameId: 2,
        chosenNumbers: [1, 2, 3, 10, 11, 12],
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

    await supertest(BASE_URL)
      .post('/bets/new-bet')
      .set('Authorization', `Bearer ${token}`)
      .send({ games })
      .expect(201)

    const { body } = await supertest(BASE_URL)
      .get(`/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.exists(body.bets, 'Bets undefined')
    assert.equal(body.user.id, user.id)
    assert.equal(body.user.username, user.username)
    assert.equal(body.user.email, user.email)
    assert.equal(body.bets.length, 3)
  })

  test('it should return 404 when providing an invalid user id for get a user', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get(`/admin/users/52`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should get all users of the system', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get(`/admin/users`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.users, 'User undefined')
    assert.equal(body.users.length, 1)
  })

  test('it should delete a user', async (assert) => {
    await supertest(BASE_URL)
      .delete(`/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const users = await User.query()
    assert.equal(users.length, 0)
  })

  test('it should return 404 when trying to delete an user with invalid id', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .delete(`/admin/users/10`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should promote a user', async (assert) => {
    const newUser = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .put(`/admin/users/${newUser.id}/promote`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.isAdmin, true)
  })

  test('it should return 404 when providing an invalid user id to promote a user', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .put(`/admin/users/10/promote`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should return 409 when trying to promote a user who already is a admin', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .put(`/admin/users/${user.id}/promote`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should downgrade a user', async (assert) => {
    const newUser = await UserFactory.merge({ isAdmin: true }).create()
    const { body } = await supertest(BASE_URL)
      .put(`/admin/users/${newUser.id}/downgrade`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.user, 'User undefined')
    assert.equal(body.user.isAdmin, false)
  })

  test('it should return 404 when providing an invalid user id to downgrade a user', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .put(`/admin/users/10/downgrade`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 404)
  })

  test('it should return 409 when trying to downgrade a user who already is a normal user', async (assert) => {
    const newUser = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .put(`/admin/users/${newUser.id}/downgrade`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  group.before(async () => {
    const password = '123456'
    const newUser = await UserFactory.merge({ password, isAdmin: true }).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email: newUser.email, password })

    token = body.token.token
    user = newUser
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
