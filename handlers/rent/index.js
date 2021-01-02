const { validationResult } = require('express-validator')
const User = require('../users/User')
const Rent = require('./Rent')
const MakeApointment = require('../makeApointment/MakeApointment')

const multer = require('multer')
const path = require('path')


module.exports = {
    get: {
        sharedRent(req, res, next) {

            const fullName = req.user.fullName
            // console.log('FULL NAME from get rent', fullName)

            Rent.find().lean().then((rent) => {
                // console.log('RENT', rent)
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
            // console.log('ID offerRentEdit', id)
            // const fullName = req.user.fullName

            Rent.findOne({ _id: id })
                .then((rent) => {
                    res.render('rent/offer-rent-edit.hbs', rent)
                })
        },

        detailsRent(req, res, next) {
            const { id } = req.params
            // console.log('FULLNAME', req.user.fullName)

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

            const { dateStart, dateEnd, startRentTime, endRentTime } = req.body

            const requestFromJoin = req

            console.log('req body for date ', req.body)
            console.log('REQUEST FROM USER JOIN ', req)

            Promise.all([
                MakeApointment.updateOne({ _id: id }, {
                    $push: {
                        apointmentDateTime: {
                            buddies: _id,
                            dateStart, dateEnd, startRentTime, endRentTime
                        },
                    }
                }),

                User.updateOne({ _id }, {
                    $push: {
                        rentHistory: _id,
                        dateStart,
                        dateEnd,
                        startRentTime,
                        endRentTime
                    }
                })
            ]).then(([updatedRent, updatedUser]) => {
                res.redirect(`/rent/details-rent/${id}`)
            })

        }
    },

    post: {
        joinRent(req, res, next) {
            const id = req.params
            const _id = req.user

            const { dateStart, dateEnd, startRentTime, endRentTime } = req.body

            console.log('REQ BODY  via post', req.body)
            console.log('REQ BODY  via post', dateStart)

            MakeApointment.create(id, {
                dateStart, dateEnd, startRentTime, endRentTime,
                driver: _id
            }).then((createdDateAndTime) => {
                res.redirect('/rent/shared-rent.hbs')
            }).catch((err) => {
                console.log(err)
            })
        },

        offerRent(req, res, next) {
            // Set The Storage Engine
            const storage = multer.diskStorage({
                destination: './public/uploads/',
                filename: function (req, file, cb) {
                    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
                }
            });

            // Init Upload
            const upload = multer({
                storage: storage,
                limits: { fileSize: 1000000 },
                fileFilter: function (req, file, cb) {
                    checkFileType(file, cb);
                }
            }).single('carImage');

            // Check File Type
            function checkFileType(file, cb) {
                // Allowed ext
                const filetypes = /jpeg|jpg|png|gif/;
                // Check ext
                const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
                // Check mime
                const mimetype = filetypes.test(file.mimetype);

                if (mimetype && extname) {
                    return cb(null, true);
                } else {
                    cb('Error: Images Only!');
                }
            }

            upload(req, res, (err) => {
                console.log('req file name ', req.file.filename)

                let { vehicleType, brand, model, constructionYear, fuelType,
                    carImage, seats, price } = req.body

                console.log("CARDIMAGE", carImage)
                console.log("vehicleType", vehicleType)

                if (err) {
                    res.render('rent/offer-rent.hbs', {
                        message: err
                    });
                } else {
                    if (req.file == undefined) {
                        res.render('rent/offer-rent.hbs', {
                            message: 'Error: No File Selected!'
                        });
                    } else {

                        Rent.create({
                            message: 'File Uploaded!',
                            carImage: `../../uploads/${req.file.filename}`,

                            vehicleType,
                            brand,
                            model,
                            constructionYear,
                            fuelType,
                            // date,
                            // time,
                            // dateend,
                            // timeend,
                            seats,
                            price,
                            oldInputForRent: {
                                vehicleType, brand, model, constructionYear, fuelType,
                                carImage, seats, price
                            },
                            driver: _id
                        }).then((createdTripp) => {
                            res.redirect('/rent/shared-rent')
                        }).catch((err) => {
                            console.log(err)
                        })
                    }
                }
            })



            // const { vehicleType, brand, model, constructionYear, fuelType,
            //     dateStart, dateEnd, carImage, seats, price } = req.body

            // const [startPoint, endPoint] = directions.split(' - ')
            // const [date, time] = dateStart.split(' - ')
            // const [dateend, timeend] = dateEnd.split(' - ')
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
                        carImage, seats, price
                    }
                    // oldInputForRent: {
                    //     vehicleType, brand, model, constructionYear, fuelType,
                    //     dateStart, dateEnd, carImage, seats, price
                    // }
                })

                return
            }
        },

        offerRentEdit(req, res, next) {
            const {
                vehicleType, brand, model, constructionYear, fuelType,
                carImage, seats, price
            } = req.body
            // const { vehicleType, brand, model, constructionYear, fuelType,
            //     dateStart, dateEnd, carImage, seats, price } = req.body

            // const [startPoint, endPoint] = directions.split(' - ')
            // const [date, time] = dateStart.split(' - ')
            // const [dateend, timeend] = dateEnd.split(' - ')
            const { _id } = req.user;
            console.log("DRIVER ID", _id)

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

            Rent.findByIdAndUpdate(id, {
                vehicleType,
                brand,
                model,
                constructionYear,
                fuelType,
                // date,
                // time,
                // dateend,
                // timeend,
                carImage,
                seats,
                price,
                oldInputForRent: {
                    vehicleType, brand, model, constructionYear, fuelType,
                    carImage, seats, price
                },
                // oldInputForRent: {
                //     vehicleType, brand, model, constructionYear, fuelType,
                //     dateStart, dateEnd, carImage, seats, price
                // },
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
