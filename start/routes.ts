import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/', 'UsersController.store')
  Route.group(() => {
    Route.get('/', 'UsersController.index')
    Route.put('/', 'UsersController.update')
    Route.delete('/', 'UsersController.destroy')
  }).middleware('auth')
}).prefix('/users')

Route.post('/forgot-password', 'PasswordsController.forgotPassword')
Route.post('/reset-password', 'PasswordsController.resetPassword')

Route.post('/sessions', 'SessionsController.store')
Route.delete('/sessions', 'SessionsController.destroy').middleware('auth')

Route.group(() => {
  Route.group(() => {
    Route.get('/:id', 'CartsController.index')
    Route.get('/', 'CartsController.indexAll')
  }).prefix('/carts')

  Route.group(() => {
    Route.group(() => {
      Route.post('/', 'CartsController.store')
      Route.put('/:id', 'CartsController.update')
      Route.delete('/:id', 'CartsController.destroy')
      Route.post('/:cartId/games/:gameId', 'CartsController.addGame')
    }).prefix('/carts')
  })
    .prefix('/admin')
    .middleware('auth')
    .middleware('adminVerifier')
})

Route.group(() => {
  Route.post('/games', 'GamesController.store')
  Route.get('/games/:id', 'GamesController.index')
  Route.put('/games/:id', 'GamesController.update')
  Route.delete('/games/:id', 'GamesController.destroy')
})
  .prefix('/admin')
  .middleware('auth')
  .middleware('adminVerifier')

Route.group(() => {
  Route.post('/new-bet', 'BetsController.store')
  Route.get('/:id', 'BetsController.index')
})
  .prefix('/bets')
  .middleware('auth')

Route.group(() => {
  Route.get('/users', 'AdminsController.indexAll')
  Route.get('/users/:id', 'AdminsController.index')
  Route.delete('/users/:id', 'AdminsController.destroy')
  Route.put('/users/:id/promote', 'AdminsController.promoteUser')
  Route.put('/users/:id/downgrade', 'AdminsController.downgradeUser')
})
  .prefix('/admin')
  .middleware('auth')
  .middleware('adminVerifier')
