const Rent = require('../rent')
const User = require('../users/User')

module.exports = {
    get: {
        home(req, res, next) {
            // const email = req.user.email
            // console.log('HOME', email)
            // console.log('user from home', req.user)
            
            // User.findOne({ email }).then((user) => {
                res.render('home/home.hbs', {
                    // isLoggedIn: req.user !== undefined,
                    // userEmailLogout: req.user ? req.user.email : '',
                    // userInfo: req.user ? email : ''
                })
            // })
        },

        post: {
            home(req, res, next) {

            }
        }
    }
}