import Route from '@ioc:Adonis/Core/Route'

Route.post('/users', 'UsersController.store')
Route.put('/users', 'UsersController.update').middleware('auth')
Route.get('/users', 'UsersController.index').middleware('auth')
Route.delete('/users', 'UsersController.destroy').middleware('auth')

Route.post('/forgot-password', 'PasswordsController.forgotPassword')
Route.post('/reset-password', 'PasswordsController.resetPassword')

Route.post('/sessions', 'SessionsController.store')
Route.delete('/sessions', 'SessionsController.destroy').middleware('auth')

Route.get('/games', 'CartsController.getRules')

// Route.get('/users', 'UsersController.indexAll').middleware('auth')
