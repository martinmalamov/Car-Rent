const router = require('../routes')

module.exports = (app) => {
    app.use('/home' , router.home)
    app.use('/user' , router.users)
    app.use('/rent' , router.rent)
}