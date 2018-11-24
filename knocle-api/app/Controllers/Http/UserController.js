'use strict'
const User = use('App/Models/User')
const Tweet = use('App/Models/Tweet')
const Hash = use('Hash')

class UserController {

    async signup({ request, auth, response }) {
        // user data from signup
        const userData = request.only(['name', 'username', 'email', 'password'])

        try {
            // save user to db
            const user = await User.create(userData)
            // generate JWT token for user
            const token = await auth.generate(user)

            return response.json({
                status: 'success',
                data: token
            })
        } catch (error) {
            return response.status(400).json({
                status: 'error',
                message: 'Problem in creating the user. Try again later.'
            })
        }
    }

    async login({ request, auth, response }) {
        try {
            const token = await auth.attempt(
                request.input('email'),
                request.input('password')
            )

            return response.json({
                status: 'success',
                data: token
            })
        } catch (error) {
            response.status(400).json({
                status: 'error',
                message: 'Invalid email/password'
            })
        }
    }

    async me ({ auth, response }) {
        const user = await User.query()
            .where('id', auth.current.user.id)
            .with('tweets', builder => {
                builder.with('user')
                builder.with('favourites')
                builder.with('replies')
            })
            .with('following')
            .with('followers')
            .with('favourites')
            .with('favourites.tweet', builder => {
                builder.with('user')
                builder.with('favourites')
                builder.with('replies')
            })
            .firstOrFail()

        return response.json({
            status: 'success',
            data: user
        })
    }

    async updateProfile ({ request, auth, response }) {
        try {
            // getting currently authenticated user
            const user = auth.current.user

            // update with new data
            user.name = request.input('name')
            user.username = request.input('username')
            user.email = request.input('email')
            user.location = request.input('location')
            user.website_url = request.input('website_url')

            await user.save()

            return response.json({
                status: 'success',
                message: 'Profile updated!',
                data: user
            })
        } catch (error) {
            return response.status(400).json({
                status: 'error',
                message: 'Problem updating profile. Try again later.'
            })
        }
    }

    async changePassword ({ request, auth, response }) {
        // get current authenticated user
        const user = auth.current.user

        const verifyPassword = await Hash.verify(
            request.input('password'),
            user.password
        )

        if (!verifyPassword) {
            return response.status(400).json({
                status: 'error',
                message: 'Password could not be verified!'
            })
        }

        user.password = await Hash.make(request.input('newPassword'))
        await user.save()

        return response.json({
            status: 'success',
            message: 'Password updated!'
        })
    }

    async showProfile ({ request, params, response }) {
        try {
            const user = await User.query()
                .where('username', params.username)
                .with('tweets', builder => {
                    builder.with('user')
                    builder.with('favourites')
                    builder.with('replies')
                })
                .with('following')
                .with('followers')
                .with('favourites')
                .with('favourites.tweet', builder => {
                    builder.with('user')
                    builder.with('favourites')
                    builder.with('replies')
                })
                .firstOrFail()

            return response.json({
                status: 'success',
                data: user
            })
        } catch (error) {
            return response.status(404).json({
                status: 'error',
                message: 'User not found.'
            })
        }
    }

    async usersToFollow ({ params, auth, response }) {

        const user = auth.current.user

        const usersAlreadyFollowing = await user.following().ids()

        const usersToFollow = await User.query()
            .whereNot('id', user.id)
            .whereNotIn('id', usersAlreadyFollowing)
            .pick(3)

        return response.json({
            status: 'success',
            data: usersToFollow
        })
    }

    async follow ({ request, auth, response }) {
        
        const user = auth.current.user

        await user.following().attach(request.input('user_id'))

        return response.json({
            status: 'success',
            data: null
        })
    }

    async unfollow ({ request, auth, response }) {
        
        const user = auth.current.user

        await user.following().deatach(request.input('user_id'))

        return response.json({
            status: 'success',
            data: null
        })
    }

    async timeline ({ auth, response }) {
        const user = await User.find(auth.current.user.id)

        const followersIds = await user.following().ids()

        followersIds.push(user.id)

        const tweets = await Tweet.query()
            .whereIn('user_id', followersIds)
            .with('user')
            .with('favourites')
            .with('replies')
            .fetch()

        return response.json({
            status: 'success',
            data: tweets
        })
    }
}

module.exports = UserController
