const { validationResult } = require('express-validator')
const User = require('../users/User')
const Rent = require('./Rent')
const MakeAppointment = require('../makeAppointment/MakeAppointment')

const multer = require('multer')
const path = require('path')
const { rejects } = require('assert')

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
            const { _id } = req.user;
            // console.log("DRIVER ID line 40", _id)

            const { id } = req.params;
            // console.log('USER ID line 43', id)

            //user information ( fullName , etc...)
            const requestOfUser = req.user

            Rent.findOne({ _id: id })

                .then((rent) => {
                    // let brandName = rent.brand
                    // let brandModel = rent.model
                    // res.body.vehicleType = vehicleType
                    // console.log('attributeArrayOfValues', rent)
                    // console.log('rent', rent)
                    // req.body.brand = rent.brand

                    res.render('rent/offer-rent-edit.hbs', rent)
                    // , {
                    //     // brand: brandName,
                    //     // model: brandModel,
                    //     isLoggedIn: requestOfUser !== undefined,
                    //     userEmailLogout: requestOfUser ? requestOfUser.email : '',
                    //     userInfo: requestOfUser ? requestOfUser.fullName : '',
                    // })
                })
        },

        detailsRent(req, res, next) {
            const { id } = req.params
            // console.log('FULLNAME', req.user.fullName)
            console.log('Creator user id ', id)

            Rent.findById(id).populate('buddies').lean().then((rent) => {

                const currentUser = JSON.stringify(req.user._id)
                // console.log('Driver user id', currentUser)

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


            // Promise.all([rentRequest, makeAppointmentRequest])
        },

        closeRent(req, res, next) {
            const { id } = req.params
            Rent.deleteOne({ _id: id }).then((deleteRent) => {
                res.redirect('/rent/shared-rent')
            })
        },

        joinRent(req, res, next) {
            const { id } = req.params
            console.log('110 id ' , id)

            // Rent.findById(id).populate('buddies').lean().then((rent) => {

            //     const currentUser = JSON.stringify(req.user._id)
            //     // console.log('Driver user id', currentUser)

            //     const availableSeats = 1

            //     res.render('rent/details-rent.hbs', {
            //         isLoggedIn: req.user !== undefined,
            //         // userEmail: req.user ? req.user.email : '',
            //         userEmailLogout: req.user ? req.user.email : '',
            //         userInfo: req.user ? req.user.fullName : '',
            //         rent,
            //         //compare id of user
            //         isTheDriver: JSON.stringify(rent.driver) === currentUser,
            //         isAlreadyJoined: JSON.stringify(rent.buddies).includes(currentUser),
            //         isSeatsAvailable: availableSeats > 0,
            //         availableSeats
            //     })
            // })

            Rent.findById(id).then((rent) => {
                let makeAppointmentIdsFromRent = rent.makeAppointmentIds

                MakeAppointment.findById(makeAppointmentIdsFromRent).then((joinedUser) => {
                    // const currentUser = JSON.stringify(req.user._id)
                    console.log('joinedUser line 116', joinedUser)
                    res.render('rent/schedule-appointment.hbs' , {
                        joinedUser
                    })


                    //     res.render('rent/details-rent.hbs', {
                    //         isLoggedIn: req.user !== undefined,
                    //         // userEmail: req.user ? req.user.email : '',
                    //         userEmailLogout: req.user ? req.user.email : '',
                    //         userInfo: req.user ? req.user.fullName : '',
                    //         rent,
                    //         //compare id of user
                    //         isTheDriver: JSON.stringify(rent.driver) === currentUser,
                    //         isAlreadyJoined: JSON.stringify(rent.buddies).includes(currentUser),
                    //         isSeatsAvailable: availableSeats > 0,
                    //         availableSeats
                })
            })

            // MakeAppointment.findById(makeAppId).then((rent) => {

            //     const currentUser = JSON.stringify(req.user._id)
            //     // console.log('Driver user id', currentUser)

            //     const availableSeats = 1

            //     res.render('rent/details-rent.hbs', {
            //         isLoggedIn: req.user !== undefined,
            //         // userEmail: req.user ? req.user.email : '',
            //         userEmailLogout: req.user ? req.user.email : '',
            //         userInfo: req.user ? req.user.fullName : '',
            //         rent,
            //         //compare id of user
            //         isTheDriver: JSON.stringify(rent.driver) === currentUser,
            //         isAlreadyJoined: JSON.stringify(rent.buddies).includes(currentUser),
            //         isSeatsAvailable: availableSeats > 0,
            //         availableSeats
            //     })
            // })

        }
    },

    post: {
        joinRent(req, res, next) {
            const { id } = req.params
            const { _id } = req.user;

            const { dateStart, dateEnd, startRentTime, endRentTime } = req.body
            console.log('dateStart 162', dateStart)

            Promise.all([
                Rent.updateOne({ _id: id }, { $push: { buddies: _id } }),
                User.updateOne({ _id }, { $push: { trippHistory: _id } })
            ]).then((joinedUsers) => {
                console.log('joinedUsers 169', joinedUsers)

                MakeAppointment.create({

                    dateStart, dateEnd, startRentTime, endRentTime,
                    driver: _id,
                    client: id
                })
                    .then((idFromMakeAppCollection) => {
                        Promise.all([
                            Rent.updateOne({ _id: id }, { $push: { makeAppointmentIds: idFromMakeAppCollection._id } }),
                        ])
                        console.log('idFromMakeAppCollection', idFromMakeAppCollection)
                        res.redirect(`/rent/shared-rent`)
                    }).catch((err) => {
                        console.log(err)
                    })

            })

        },

        offerRent(req, res, next) {

            //Set The Storage Engine
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
                })

                return
            }

            upload(req, res, (err) => {

                let { vehicleType, brand, model, constructionYear, fuelType,
                    carImage, seats, price } = req.body

                let attributeArrayOfValues = {}
                attributeArrayOfValues.vehicleType = vehicleType
                attributeArrayOfValues.brand = brand
                attributeArrayOfValues.model = model
                attributeArrayOfValues.constructionYear = constructionYear
                attributeArrayOfValues.fuelType = fuelType
                attributeArrayOfValues.carImage = carImage
                attributeArrayOfValues.seats = seats
                attributeArrayOfValues.price = price

                if (err) {
                    res.render('rent/offer-rent.hbs', {
                        message: err,
                        oldInputForRent: {
                            vehicleType, brand, model, constructionYear, fuelType,
                            carImage, seats, price
                        }
                    });
                } else {
                    if (req.file == undefined) {
                        res.render('rent/offer-rent.hbs', {
                            message: 'Error: No File Selected(image is required)!',
                            oldInputForRent: {
                                vehicleType, brand, model, constructionYear, fuelType,
                                carImage, seats, price
                            }
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
                            seats,
                            price,
                            oldInputForRent: {
                                vehicleType, brand, model, constructionYear, fuelType,
                                carImage, seats, price
                            },
                            attributeArrayOfValues,

                            driver: _id,

                        }).then((createdTripp) => {
                            res.redirect('/rent/shared-rent')
                        }).catch((err) => {
                            console.log(err)
                        })
                    }
                }
            })

        },

        //Edit functionality
        offerRentEdit(req, res, next) {
            // Set The Storage Engine
            const storage = multer.diskStorage({
                destination: './public/uploads_edit/',
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

            upload(req, res, (err) => {
                let { vehicleType, brand, model, constructionYear, fuelType,
                    carImage, seats, price } = req.body

                // const testReq = req;
                // console.log("DRIVER ID line 357", testReq)
                const id = req.params.id;
                // console.log("Creator user id", id)

                const { _id } = req.user._id;
                // console.log('Driver id user', _id)

                if (err) {
                    res.render(`rent/offer-rent-edit/${id}.hbs`, {
                        message: err,
                        oldInputForRent: {
                            vehicleType, brand, model, constructionYear, fuelType,
                            carImage, seats, price
                        }
                    });
                } else {
                    if (req.file == undefined) {
                        res.render(`rent/offer-rent-edit/${id}.hbs`, {
                            message: 'Error: No File Selected(image is required)!',
                            oldInputForRent: {
                                vehicleType, brand, model, constructionYear, fuelType,
                                carImage, seats, price
                            }
                        });
                    } else {

                        Rent.findByIdAndUpdate(id, {
                            message: 'File Uploaded!',
                            carImage: `../../uploads_edit/${req.file.filename}`,

                            vehicleType,
                            brand,
                            model,
                            constructionYear,
                            fuelType,
                            seats,
                            price,
                            oldInputForRent: {
                                vehicleType, brand, model, constructionYear, fuelType,
                                carImage, seats, price
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
                }
            })
        }
    },


    put: {

    }
}





// // const [startPoint, endPoint] = directions.split(' - ')
// // const [date, time] = dateStart.split(' - ')
// // const [dateend, timeend] = dateEnd.split(' - ')

// // console.log('req params ID ', req.params.id)
// // console.log('body ' , req.body)



// let customersArray = []

// function addDevice() {

//     // let idOfCustomers = new Promise((resolve, reject) => {
//     //     return MakeAppointment.findById(id)
//     // })
//     // console.log('customersArray', a)

//     // idOfCustomers.then((clients) => {
//     //     customersArray.push(clients)
//     //     console.log('test', customersArray)
//     // })
// }
// console.log('test', addDevice())


//2. let customersArray = []
// for (let i = 0; i < idOfCustomers.length; i++) {
//     customersArray.push(idOfCustomers[i]);
// }
// console.log('customersArray', customersArray)

// console.log('mk id', MakeAppointment.findOne({id}))


// 3.get : join rent code
// const { id } = req.params
// const { _id } = req.user
// console.log('user id', id)
// console.log('rent id', _id)

// //stringify make literal to be string
// const currentUser = JSON.stringify(req.user._id)
// console.log('currentUser', currentUser)

// Promise.all([
//     Rent.updateOne({ _id: id }, { $push: { buddies: _id } }),
//     User.updateOne({ _id }, { $push: { trippHistory: _id } })
// ]).then(([updatedTripp, updatedUser]) => {
//     res.redirect(`/rent/details-rent/${id}`)
// })