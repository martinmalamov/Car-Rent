const router = require('express').Router()
const handler = require('../handlers/rent')
const isAuth = require('../utils/isAuth')
const validations = require('../utils/validator')

//GET
router.get('/declined-rent/:id', isAuth(), handler.put.declined)
router.get('/my-posts/:id', isAuth(), handler.get.myPosts)

router.get('/shared-rent', isAuth(), handler.get.sharedRent)
router.get('/offer-rent', isAuth(), handler.get.offerRent)
router.get('/offer-rent-edit/:id', isAuth(), handler.get.offerRentEdit)
router.get('/details-rent/:id', isAuth(), handler.get.detailsRent)
router.get('/schedule-appointment/:id', isAuth(), handler.get.joinRent)

//POST
router.post('/offer-rent', isAuth(), validations, handler.post.offerRent)
router.post('/join-rent/:id', isAuth(), handler.post.joinRent)
router.post('/offer-rent-edit/:id', isAuth(),  handler.post.offerRentEdit)

//PUT 
router.get('/approved-rent/:id', isAuth(), handler.put.approved)
//DELETE
router.get('/close-rent/:id', isAuth(), handler.delete.closeRent)

module.exports = router