const User = require('./User')
const jwt = require('../../utils/jwt')
const { cookie } = require('../../config/config')
const bcrypt = require('bcrypt')

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
        UserInfo(req, res, next) {
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
            }).then(async ([match, user]) => {
                // console.log('MATCH', match)
                // console.log('USER ', user)
                // console.log('USER body password', password)
                // console.log('USER hashed password', user.password)

                const validPassword = await bcrypt.compare(req.body.password, user.password);
                if (!validPassword) {
                    // return res.status(400).send('Invalid Email or Password.')
                    res.render('users/login.hbs', {
                        message: 'username or password is not valid !',
                        oldInput: { email, password }
                    })
                    return
                    // return res.json({ success: false, message: 'passwords do not match' });
                } else {
                    const token = jwt.createToken(user)
                    res.status(201).cookie(cookie, token, { maxAge: 3600000 }).redirect('/rent/shared-rent')
                }

                // const ValidateSalt = async ()  =>  {
                //     const salt = await bcrypt.genSalt(11)
                //     const hashedPassword = await bcrypt.hash('shhhhaNO' , salt)
                //     // const hashedPassword = await bcrypt.hash(password, salt)
                //     console.log('Hashed login', hashedPassword)
                //     return hashedPassword
                // }
                // bcrypt.compare(req.body.password, 'shhhhaNO', function (err) {
                //     console.log('Password', password)
                //     console.log('user password', user.password)
                //     if (ValidateSalt() !== user.password) {
                //         return res.json({ success: false, message: 'passwords do not match' });
                //     } else {
                //         const token = jwt.createToken(user)
                //         return res.status(201).cookie(cookie, token, { maxAge: 3600000 }).redirect('/rent/shared-rent')
                //     }
                // })

                // bcrypt.compare(password, 'shhhhaNO', function (err , res) {
                //     if (err) {
                //         console.log(err)
                //     }
                //     if (res) {
                //         const token = jwt.createToken(user)
                //         res.status(201).cookie(cookie, token, { maxAge: 3600000 }).redirect('/rent/shared-rent')
                //     }
                //     else {
                //         // response is OutgoingMessage object that server response http request
                //         return res.json({ success: false, message: 'passwords do not match' });
                //     }
                // })

                // if (ValidateSalt() !== user.password) {
                //     res.render('users/login.hbs', {
                //         message: 'Password do not match!',
                //         oldInput: { email, password }
                //     })

                //     return
                // }


                // if (password !== user.password) {
                //     alert('Password don\'t match')
                // }
                // else if (password === '') {
                //     alert('Blank password')
                // }
                // if (!match) {
                //     // next(err) //TODO
                //     return next('Incorrect login or password'); 
                // }

                // const token = jwt.createToken(user)

                // res.status(201).cookie(cookie, token, { maxAge: 3600000 }).redirect('/rent/shared-rent')
            }).catch((err) => {
                res.render('users/login.hbs', {
                    message: 'username or password is not valid !',
                    oldInput: { email, password }
                })
                return
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
                    const token = jwt.createToken(createdUser._id)
                    res.status(201).cookie(cookie, token, { maxAge: 3600000 }).redirect('/rent/shared-rent')
                    // return res.redirect('/rent/shared-rent')
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