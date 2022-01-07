import Route from '@ioc:Adonis/Core/Route'

Route.post('/users', 'UsersController.store')
Route.put('/users/:id', 'UsersController.update').middleware('auth')

Route.post('/forgot-password', 'PasswordsController.forgotPassword')
Route.post('/reset-password', 'PasswordsController.resetPassword')
