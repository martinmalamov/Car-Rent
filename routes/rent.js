const router = require('express').Router()
const handler = require('../handlers/rent')
const isAuth = require('../utils/isAuth')
const validations = require('../utils/validator')


router.get('/declined-rent/:id', isAuth(), handler.get.declined)
router.get('/approved-rent/:id', isAuth(), handler.put.approved)

router.get('/shared-rent', isAuth(), handler.get.sharedRent)
router.get('/offer-rent', isAuth(), handler.get.offerRent)
router.get('/offer-rent-edit/:id', isAuth(), handler.get.offerRentEdit)
router.get('/details-rent/:id', isAuth(), handler.get.detailsRent)
router.get('/close-rent/:id', isAuth(), handler.get.closeRent)
router.get('/schedule-appointment/:id', isAuth(), handler.get.joinRent)
// router.get('/schedule-appointment/:id/:makeAppId', isAuth(), handler.get.joinRent)

router.post('/offer-rent', isAuth(), validations, handler.post.offerRent)

// router.get('/join-rent/:id', isAuth(), handler.post.joinRent)
router.post('/join-rent/:id', isAuth(), handler.post.joinRent)

router.post('/offer-rent-edit/:id', isAuth(),  handler.post.offerRentEdit)


// router.get('/' , function(req,res,next) {
//     res.send('respond with a resource')
// })

module.exports = router