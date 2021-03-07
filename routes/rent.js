const router = require('express').Router()
const handler = require('../handlers/rent')
const isAuth = require('../utils/isAuth')
const validations = require('../utils/validator')

//GET
router.get('/my-posts', isAuth(), handler.get.myPosts)

router.get('/shared-rent', isAuth(), handler.get.sharedRent)
router.get('/offer-rent', isAuth(), handler.get.offerRent)
router.get('/offer-rent-edit/:id', isAuth(), handler.get.offerRentEdit)
router.get('/details-rent/:id', isAuth(), handler.get.detailsRent)

//POST
router.post('/offer-rent', isAuth(), validations, handler.post.offerRent)
router.post('/offer-rent-edit/:id', isAuth(),  handler.post.offerRentEdit)

//DELETE
router.get('/close-rent/:id', isAuth(), handler.delete.closeRent)

module.exports = router