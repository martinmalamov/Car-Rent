const User = require('./User')
const jwt = require('../../utils/jwt')
const { cookie } = require('../../config/config')

module.exports = {
    get: {
        login(req, res, next) {
            res.render('users/login.hbs')
        },

        register(req, res, next) {
            res.render('users/register.hbs')
        },

        logout(req, res, next) {
            req.user = null
            res.clearCookie(cookie).redirect('/home/')
        },
        UserInfo(req , res ,next) {
            const name = req._id
            console.log('Req body fullname from get', name)
        }

    },


    post: {
        login(req, res, next) {
            const { email, password } = req.body
            console.log('Req body', req.body)
           
            User.findOne({ email }).then((user) => {
                return Promise.all([user.passwordsMatch(password), user])
            }).then(([match, user]) => {
                if (!match) {
                    next(err) //TODO
                    return
                }

                const token = jwt.createToken(user)

                res.status(201).cookie(cookie, token, { maxAge: 3600000 }).redirect('/rent/shared-rent')
            })
        },

        register(req, res, next) {
            const { fullName, phoneNumber, email, password, rePassword } = req.body

            if (password !== rePassword) {
                res.render('users/register.hbs', {
                    message: 'Password do not match!',
                    oldInput: { fullName, phoneNumber, email, password, rePassword }
                })

                return
            }
            const emailCredentials = email

            User.findOne({ email })
                .then((currentUser) => {
                    if (currentUser) {
                        throw new Error('The given emails already exist!')
                    }

                    return User.create({
                        email,
                        phoneNumber
                        ,
                        fullName
                        , password
                    })
                })
                .then((createdUser) => {
                    return res.redirect('/user/login')
                })
                .catch((err) => {
                    res.render('users/register.hbs', {
                        message: err.message,
                        oldInput: { fullName, phoneNumber, email, password, rePassword }
                    })
                })

        },

    }
}