'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

// User Routes
Route.post('/signup', 'UserController.signup')
Route.post('/login', 'UserController.login')

Route.group(() => {
  Route.get('/me', 'UserController.me')
  Route.put('/update_profile', 'UserController.updateProfile')
  Route.put('/change_password', 'UserController.changePassword')
})
  .prefix('account')
  .middleware(['auth:jwt'])

Route.get(':username', 'UserController.showProfile')

Route.group(() => {
  Route.get('/users_to_follow', 'UserController.usersToFollow')
  Route.post('/follow/:id', 'UserController.follow')
  Route.post('/unfollow/:id', 'UserController.nfollow')
  Route.get('/timeline', 'UserController.timeline')
})
  .prefix('users')
  .middleware(['auth:jwt'])

// Tweet Routes
Route.post('/tweet', 'TweetController.tweet').middleware(['auth:jwt'])
Route.get('/tweets/:id', 'TweetController.show')
Route.post('/tweets/reply/:id', 'TweetController.reply').middleware(['auth:jwt'])
Route.delete('/tweets/destroy/:id', 'TweetController.destroy').middleware(['auth:jwt'])

Route.group(() => {
  Route.post('/create', 'FavouriteController.favourite')
  Route.delete('/destroy/:id', 'FavouriteController.unFavourite')
})
  .prefix('favourites')
  .middleware(['auth:jwt'])

