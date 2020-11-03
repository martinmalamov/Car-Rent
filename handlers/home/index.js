const Rent = require('../rent')

module.exports = {
    get: {
        home(req, res, next) {
            res.render('home/home.hbs', {
                isLoggedIn: req.user !== undefined,
                userEmail: req.user ? req.user.email : ''
            })
        }
    },
    post: {
        home(req, res, next) {

        }
    }
}