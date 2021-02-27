module.exports = {
    get: {
        home(req, res, next) {
            const email = req.user.email
                res.render('home/home.hbs', {
                    isLoggedIn: req.user !== undefined,
                    userEmailLogout: req.user ? req.user.email : '',
                    userInfo: req.user ? email : ''
                })
        },
    }
}