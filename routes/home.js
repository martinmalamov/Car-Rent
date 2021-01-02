const router = require('express').Router()
const handler = require('../handlers/home')
const isAuth = require('../utils/isAuth')

router.get('/', isAuth(true), handler.get.home)

//multer
var multer = require('multer')
var upload = multer({dest: 'public/uploads/'})

router.get('/', function(req , res ,next) {
    res.render('index' , {title: 'Express'})
})

router.post('/', upload.any(), function(req , res ,next) {
    res.render(req.files)
})
module.exports = router 