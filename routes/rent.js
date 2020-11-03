const router = require('express').Router()
const handler = require('../handlers/rent')
const isAuth = require('../utils/isAuth')
const validations = require('../utils/validator')

router.get('/shared-rent', isAuth(), handler.get.sharedRent)
router.get('/offer-rent', isAuth(), handler.get.offerRent)
router.get('/details-rent/:id', isAuth(), handler.get.detailsRent)
router.get('/close-rent/:id', isAuth(), handler.get.closeRent)
router.get('/join-rent/:id', isAuth(), handler.get.joinRent)

router.post('/offer-rent', isAuth(), validations, handler.post.offerRent)

module.exports = router