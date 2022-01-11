import Route from '@ioc:Adonis/Core/Route'

Route.post('/users', 'UsersController.store')
Route.put('/users', 'UsersController.update').middleware('auth')
Route.get('/users', 'UsersController.index').middleware('auth')
Route.delete('/users', 'UsersController.destroy').middleware('auth')

Route.post('/forgot-password', 'PasswordsController.forgotPassword')
Route.post('/reset-password', 'PasswordsController.resetPassword')

Route.post('/sessions', 'SessionsController.store')
Route.delete('/sessions', 'SessionsController.destroy').middleware('auth')

Route.get('/games', 'CartsController.index')

Route.group(() => {
  Route.post('/cart', 'CartsController.store')
  Route.put('/cart/:id', 'CartsController.update')
  Route.delete('/cart/:id', 'CartsController.destroy')
  Route.get('/cart/all', 'CartsController.indexAll')
})
  .middleware('auth')
  .middleware('adminVerifier')

Route.group(() => {
  Route.post('/games', 'GamesController.store')
  Route.get('/games/:id', 'GamesController.index')
  Route.put('/games/:id', 'GamesController.update')
  Route.delete('/games/:id', 'GamesController.destroy')
})
  .prefix('/admin')
  .middleware('auth')
  .middleware('adminVerifier')

// Route.get('/users', 'UsersController.indexAll').middleware('auth')
