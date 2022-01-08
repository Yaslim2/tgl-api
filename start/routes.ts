import Route from '@ioc:Adonis/Core/Route'

Route.post('/users', 'UsersController.store')
Route.put('/users/:id', 'UsersController.update').middleware('auth')
Route.get('/users/:id', 'UsersController.index').middleware('auth')
Route.get('/users', 'UsersController.indexAll').middleware('auth')
Route.delete('users/:id', 'UsersController.destroy').middleware('auth')

Route.post('/forgot-password', 'PasswordsController.forgotPassword')
Route.post('/reset-password', 'PasswordsController.resetPassword')

Route.post('/sessions', 'SessionsController.store')
Route.delete('/sessions', 'SessionsController.destroy').middleware('auth')
