const router = require('express').Router()
const handler = require('../handlers/users/index')
const isAuth = require('../utils/isAuth')

router.get('/login', handler.get.login)
router.get('/register', handler.get.register)
router.get('/logout', isAuth(),  handler.get.logout)

router.get('/rent/shared-rent', isAuth(),  handler.get.UserInfo)

router.post('/login', handler.post.login)
router.post('/register', handler.post.register)

module.exports = router 