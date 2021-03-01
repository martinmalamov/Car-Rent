const { validationResult } = require('express-validator')
const User = require('../users/User')
const Rent = require('./Rent')
const MakeAppointment = require('../makeAppointment/MakeAppointment')

const multer = require('multer')
const path = require('path')
//TODO add functionality for notificiations and schedule-appointment remove after certain hours

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
            const { id } = req.params;

            Rent.findOne({ _id: id }).lean()
                .then((rent) => {
                    const fullName = req.user.fullName

                    res.render(`rent/offer-rent-edit.hbs`, {
                        isLoggedIn: req.user !== undefined,
                        userEmailLogout: req.user ? req.user.email : '',
                        userInfo: req.user ? fullName : '',
                        rent
                    })
                })
        },

        detailsRent(req, res, next) {
            const { id } = req.params
            // console.log('FULLNAME', req.user.fullName)
            console.log('Creator user id ', id)

            Rent.findById(id).populate('buddies').lean().then((rent) => {

                const currentUser = JSON.stringify(req.user._id)
                // console.log('Driver user id', currentUser)
                console.log('rent 81 line', rent.driver)

                User.findById(rent.driver).then((userICollection) => {
                    const name = userICollection.fullName

                    res.render('rent/details-rent.hbs', {
                        isLoggedIn: req.user !== undefined,
                        // userEmail: req.user ? req.user.email : '',
                        userEmailLogout: req.user ? req.user.email : '',
                        userInfo: req.user ? req.user.fullName : '',
                        rent,
                        name,
                        //compare id of user
                        isTheDriver: JSON.stringify(rent.driver) === currentUser,
                        isAlreadyJoined: JSON.stringify(rent.buddies).includes(currentUser),
                        isSeatsAvailable: availableSeats > 0,
                        availableSeats
                    })
                })

                const availableSeats = 1

                // if()


            })


            // Promise.all([rentRequest, makeAppointmentRequest])
        },

        closeRent(req, res, next) {
            const { id } = req.params
            Rent.deleteOne({ _id: id }).then((deleteRent) => {
                res.redirect('/rent/shared-rent')
            })
        },

        declined(req, res, next) {
            const { id } = req.params
            MakeAppointment.updateOne({ _id: id }).then((updateStatus) => {
                res.redirect('/rent/schedule-appointment')
            })
        },


        joinRent(req, res, next) {
            const { id } = req.params
            console.log('You are in get:schedule-appointment!!!')



            Rent.findById(id).then(async (rent) => {
                let allScheduledUsersForRent = []
                for (let i = 0; i < rent.makeAppointmentIds.length; i++) {
                    allScheduledUsersForRent.push(rent.makeAppointmentIds[i])
                }

                let allScheduledUsersForRentForTable = []

                for (let k = 0; k < allScheduledUsersForRent.length; k++) {
                    //VERY IMPORTANT , ERROR if we don't insert <lean()>
                    // Handlebars: Access has been denied to resolve the property "fullName" because it is not an "own property" of its parent.
                    // You can add a runtime option to disable the check or this warning: 
                    //The lean method of mongoose returns plain JavaScript objects (POJOs), not Mongoose documents.
                    await MakeAppointment.findByIdAndUpdate(allScheduledUsersForRent[k]).lean().then((array) => {

                        let confirmStatus = true

                        console.log('array 124', array)
                        if (array.status === false && confirmStatus === false) {
                            array.statusResult = 'Declined'
                        } else if (array.status === true && confirmStatus === true) {
                            // if()
                            array.statusResult = 'Approved'
                        }
                        console.log('array 144', array.statusResult)
                        allScheduledUsersForRentForTable.push(array)
                    })
                }
                // console.log('allScheduledUsersForRentForTable 151', allScheduledUsersForRentForTable)

                const currentUser = JSON.stringify(req.user._id)

                res.render('rent/schedule-appointment', {
                    isLoggedIn: req.user !== undefined,
                    userEmailLogout: req.user ? req.user.email : '',
                    userInfo: req.user ? req.user.fullName : '',
                    allScheduledUsersForRentForTable,
                    isTheDriver: JSON.stringify(rent.driver) === currentUser,
                    statusResult: allScheduledUsersForRentForTable.statusResult

                })
            })
        }
    },

    post: {
        joinRent(req, res, next) {
            const { id } = req.params
            const { _id } = req.user;
            let status = false
            let confirmStatus = true
            let statusResult = ''

            const { dateStart, dateEnd, startRentTime, endRentTime } = req.body
            console.log('dateStart 162', dateStart)

            let fullName = req.user.fullName
            console.log('fullname 193', fullName)

            Promise.all([
                Rent.updateOne({ _id: id }, { $push: { buddies: _id } }),
                User.updateOne({ _id }, { $push: { trippHistory: _id } })
            ]).then((joinedUsers) => {
                // console.log('joinedUsers 169', joinedUsers)

                MakeAppointment.create({

                    dateStart, dateEnd, startRentTime, endRentTime,
                    fullName,
                    status: status,
                    confirmStatus: confirmStatus,
                    statusResult: statusResult = "Pending...",
                    driver: _id,
                    client: id
                })
                    .then((idFromMakeAppCollection, err) => {
                        Promise.all([
                            Rent.updateOne({ _id: id }, { $push: { makeAppointmentIds: idFromMakeAppCollection._id } }),
                        ])

                        // MakeAppointment.findByIdAndUpdate({ _id },
                        //     { statusResult: idFromMakeAppCollection.statusResult = "Pending..." })
                        // console.log('idFromMakeAppCollection', idFromMakeAppCollection)

                        if (!err) {
                            // Rent.findById(id).then((rent) => {
                            //     res.render(`/rent/details-rent/${id}`, {
                            //         successJoin: setTimeout(() => {
                            //             "Successfully scheduled for this rent!"
                            //         }, 5000)
                            //     })
                            // }


                            //redirect accept only (status , path)
                            res.redirect(`/rent/details-rent/${id}`)

                        }
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

                let oldInputInformationAboutCarSpecifications = {}
                oldInputInformationAboutCarSpecifications.vehicleType = vehicleType
                oldInputInformationAboutCarSpecifications.brand = brand
                oldInputInformationAboutCarSpecifications.model = model
                oldInputInformationAboutCarSpecifications.constructionYear = constructionYear
                oldInputInformationAboutCarSpecifications.fuelType = fuelType
                oldInputInformationAboutCarSpecifications.carImage = carImage
                oldInputInformationAboutCarSpecifications.seats = seats
                oldInputInformationAboutCarSpecifications.price = price

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
                            // oldInputForRent: {
                            //     vehicleType, brand, model, constructionYear, fuelType,
                            //     carImage, seats, price
                            // },
                            oldInputInformationAboutCarSpecifications: {
                                vehicleType, brand, model, constructionYear, fuelType,
                                carImage, seats, price
                            },

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
                    res.render(`/rent/offer-rent-edit.hbs/${id}`, {
                        message: err,
                        oldInputForRent: {
                            vehicleType, brand, model, constructionYear, fuelType,
                            carImage, seats, price
                        }
                    });
                } else {
                    if (req.file == undefined) {
                        res.render(`/rent/offer-rent-edit.hbs/${id}`, {
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
                            oldInputInformationAboutCarSpecifications: {
                                vehicleType, brand, model, constructionYear, fuelType,
                                carImage, seats, price
                            },
                            driver: _id
                            // $set: {
                            //     ...req.body
                            // }
                        }).then((createdTripp) => {
                            res.redirect(`/rent/details-rent/${id}`)
                        }).catch((err) => {
                            console.log(err)
                        })
                    }
                }
            })
        }
    },


    put: {
        approved(req, res, next) {
            const { id } = req.params
            const { _id } = req.user;

            console.log('makeAppointments collection id 110', id)
            console.log('rent collection driver 111', _id)

            try {
                MakeAppointment.findById(id).updateOne({ $set: { status: true, confirmStatus: true } }).lean().then((updateStatus) => {
                    console.log('updateStatus from approved 114 line', updateStatus)
                })
            } catch (error) {
                console.error("465 line fail for APPROVED command");
            }


            MakeAppointment.findById(id).lean().then((makeAppEntities) => {
                const rentId = makeAppEntities.client
                res.redirect(`/rent/schedule-appointment/${rentId}`)
            })
        },
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
