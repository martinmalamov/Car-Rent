// const User = require('../users/User')
// const { validationResult } = require('express-validator')
// const MakeApointment = require('./MakeApointment')

// module.exports = {
//     get: {
//         joinRent(req, res, next) {
//             const { id } = req.params
//             const { _id } = req.user

//             const { dateStart, dateEnd, startRentTime, endRentTime } = req.body

//             console.log('req body for date ', req.body)

//             Promise.all([
//                 MakeApointment.updateOne({ _id: id }, {
//                     $push: {
//                         apointmentDateTime: {
//                             buddies: _id,
//                             dateStart, dateEnd, startRentTime, endRentTime
//                         }
//                     }
//                 }),
//                 User.updateOne({ _id }, {
//                     $push: {
//                         rentHistory: _id,
//                         dateStart,
//                         dateEnd,
//                         startRentTime,
//                         endRentTime
//                     }
//                 })
//             ]).then(([updatedRent, updatedUser]) => {
//                 res.redirect(`/rent/details-rent/${id}`)
//             })

//         }
//     },

//     post: {
//         joinRent(req, res, next) {
//             const id = req.params
//             const _id = req.user

//             const { dateStart, dateEnd, startRentTime, endRentTime } = req.body

//             console.log('REQ BODY  via post', req.body)

//             MakeApointment.create({
//                 dateStart, dateEnd, startRentTime, endRentTime,
//                 driver: _id
//             }).then((createdDateAndTime) => {
//                 res.redirect('/rent/shared-rent')
//             }).catch((err) => {
//                 console.log(err)
//             })
//         },
//     }
// }
