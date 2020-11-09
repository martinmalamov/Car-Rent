const User = require('../users/User')
const { validationResult } = require('express-validator')
const Rent = require('./Rent')

module.exports = {
    get: {
        sharedRent(req, res, next) {

            const fullName = req.user.fullName
            console.log('FULL NAME from get rent', fullName)

            Rent.find().lean().then((rent) => {
                res.render('rent/shared-rent', {
                    isLoggedIn: req.user !== undefined,
                    userEmailLogout: req.user ? req.user.email : '',
                    userInfo: req.user ? fullName : '',
                    rent
                })
            })
        },

        offerRent(req, res, next) {
            const fullName = req.user.fullName

            res.render('rent/offer-rent.hbs', {
                isLoggedIn: req.user !== undefined,
                userEmailLogout: req.user ? req.user.email : '',
                userInfo: req.user ? fullName : ''
            })
        },

        offerRentEdit(req, res, next) {
            const { id } = req.params
            console.log('ID offerRentEdit', id)
            // const fullName = req.user.fullName

            Rent.findOne({ _id: id })
                .then((rent) => {
                    res.render('rent/offer-rent-edit.hbs', rent)
                })
        },

        detailsRent(req, res, next) {
            const { id } = req.params
            console.log('ID', req.user.fullName)

            Rent.findById(id).populate('buddies').lean().then((rent) => {

                const currentUser = JSON.stringify(req.user._id)
                console.log('Current USER', currentUser)

                const availableSeats = 1

                res.render('rent/details-rent.hbs', {
                    isLoggedIn: req.user !== undefined,
                    // userEmail: req.user ? req.user.email : '',
                    userEmailLogout: req.user ? req.user.email : '',
                    userInfo: req.user ? req.user.fullName : '',
                    rent,
                    //compare id of user
                    isTheDriver: JSON.stringify(rent.driver) === currentUser,
                    isAlreadyJoined: JSON.stringify(rent.buddies).includes(currentUser),
                    isSeatsAvailable: availableSeats > 0,
                    availableSeats
                })
            })
        },

        closeRent(req, res, next) {
            const { id } = req.params
            Rent.deleteOne({ _id: id }).then((deleteRent) => {
                res.redirect('/rent/shared-rent')
            })
        },

        joinRent(req, res, next) {
            const { id } = req.params
            const { _id } = req.user

            Promise.all([
                Rent.updateOne({ _id: id }, { $push: { buddies: _id } }),
                User.updateOne({ _id }, { $push: { rentHistory: _id } })
            ]).then(([updatedRent, updatedUser]) => {
                res.redirect(`/rent/details-rent/${id}`)
            })

        }
    },

    post: {
        offerRent(req, res, next) {
            const { vehicleType, brand, model, constructionYear, fuelType,
                dateStart, dateEnd, carImage, seats, price } = req.body

            // const [startPoint, endPoint] = directions.split(' - ')
            const [date, time] = dateStart.split(' - ')
            const [dateend, timeend] = dateEnd.split(' - ')
            const { _id } = req.user;

            const errors = validationResult(req)
            console.log("ERROR", errors)

            if (!errors.isEmpty()) {
                res.render('rent/offer-rent.hbs', {
                    isLoggedIn: req.user !== undefined,
                    userInfo: req.user ? req.user.email : '',
                    message: errors.array()[0].msg,
                    oldInputForRent: {
                        vehicleType, brand, model, constructionYear, fuelType,
                        dateStart, dateEnd, carImage, seats, price
                    }
                })

                return
            }

            Rent.create({
                vehicleType,
                brand,
                model,
                constructionYear,
                fuelType,
                date,
                time,
                dateend,
                timeend,
                carImage,
                seats,
                price,
                oldInputForRent: {
                    vehicleType, brand, model, constructionYear, fuelType,
                    dateStart, dateEnd, carImage, seats, price
                },
                driver: _id
            }).then((createdTripp) => {
                res.redirect('/rent/shared-rent')
            })

        },

        offerRentEdit(req, res, next) {
            const { vehicleType, brand, model, constructionYear, fuelType,
                dateStart, dateEnd, carImage, seats, price } = req.body

            // const [startPoint, endPoint] = directions.split(' - ')
            const [date, time] = dateStart.split(' - ')
            const [dateend, timeend] = dateEnd.split(' - ')
            const { _id } = req.user;
            console.log("DRIVER ID" , _id)

            const { id } = req.params;
            console.log('USER ID ', id)
            // console.log('req params ID ', req.params.id)
            // console.log('body ' , req.body)


            const errors = validationResult(req)
            console.log("ERROR", errors)

            if (!errors.isEmpty()) {
                res.render(`rent/offer-rent-edit/${id}.hbs`, {
                    isLoggedIn: req.user !== undefined,
                    userEmail: req.user ? req.user.email : '',
                    message: errors.array()[0].msg
                })

                return
            }

            Rent.findByIdAndUpdate( id , {
                vehicleType,
                brand,
                model,
                constructionYear,
                fuelType,
                date,
                time,
                dateend,
                timeend,
                carImage,
                seats,
                price,
                oldInputForRent: {
                    vehicleType, brand, model, constructionYear, fuelType,
                    dateStart, dateEnd, carImage, seats, price
                },
                driver: _id
                // $set: {
                //     ...req.body
                // }
            }).then((createdTripp) => {
                res.redirect(`/rent/shared-rent`)
            }).catch((err) => {
                console.log(err)
            })
        }
    },

    put: {

    }
}