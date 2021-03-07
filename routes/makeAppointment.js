const router = require('express').Router()
const handler = require('../handlers/makeAppointment')
const isAuth = require('../utils/isAuth')
const validations = require('../utils/validator')

//GET
router.get('/schedule-appointment/:id', isAuth(), handler.get.joinRent)

//POST
router.post('/join-rent/:id', isAuth(), handler.post.joinRent)

//PUT
router.get('/approved-rent/:id', isAuth(), handler.put.approved)
router.get('/declined-rent/:id', isAuth(), handler.put.declined)

module.exports = router