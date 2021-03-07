const User = require('../users/User')
const Rent = require('../rent/Rent')
const { validationResult } = require('express-validator')
const MakeAppointment = require('./MakeAppointment')

module.exports = {
    get: {
        joinRent(req, res, next) {
            const { id } = req.params
            console.log('You are in get:schedule-appointment!!!')

            Rent.findById(id).then(async (rent) => {
                let allScheduledUsersForRent = []
                console.log('rent makeAPp', rent)
                for (let i = 0; i < rent.makeAppointmentIds.length; i++) {
                    allScheduledUsersForRent.push(rent.makeAppointmentIds[i])
                }
                let allScheduledUsersForRentForTable = []

                for (let k = 0; k < allScheduledUsersForRent.length; k++) {
                    //VERY IMPORTANT , ERROR if we don't insert <lean()>
                    // Handlebars: Access has been denied to resolve the property "fullName" because it is not an "own property" of its parent.
                    // You can add a runtime option to disable the check or this warning: 
                    //The lean method of mongoose returns plain JavaScript objects (POJOs), not Mongoose documents.
                    await MakeAppointment.findById(allScheduledUsersForRent[k]).lean().then((array) => {

                        console.log('array 137', array)
                        let confirmStatus = array.confirmStatus
                        console.log('array 139', confirmStatus)

                        if (array.status === false && confirmStatus === false) {
                            array.statusResult = 'Declined'
                            array.isApproved = false
                        } else if (array.status === true && confirmStatus === true) {
                            // if()
                            array.statusResult = 'Approved'
                            array.isApproved = true
                        }
                        // console.log('array 144', array.statusResult)
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
                    isTheowner: JSON.stringify(rent.owner_id) === currentUser,
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
                Rent.updateOne({ _id: id }, { $push: { enrolledCustomers: _id } }),
                // User.updateOne({ _id }, { $push: { personalRents: _id } })
            ]).then((joinedUsers) => {
                // console.log('joinedUsers 169', joinedUsers)

                MakeAppointment.create({

                    dateStart, dateEnd, startRentTime, endRentTime,
                    fullName,
                    status: status,
                    confirmStatus: confirmStatus,
                    statusResult: statusResult = "Pending...",
                    enrolledCustomers: _id,
                    owner_id: id,
                })
                    .then((idFromMakeAppCollection, err) => {
                        Promise.all([
                            Rent.updateOne({ _id: id },
                                { $push: { makeAppointmentIds: idFromMakeAppCollection._id } })
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
        }

    },

    put: {
        async approved(req, res, next) {
            const { id } = req.params

            try {
                await MakeAppointment.findById(id).updateOne(
                    { $set: { status: true, confirmStatus: true } })
                    .lean()
                    .then((updateStatus) => {
                        // console.log('updateStatus from approved 114 line', updateStatus)
                    })
            } catch (error) {
                console.error(" fail APPROVED command");
            }

            await MakeAppointment.findById(id).lean().then((makeAppEntities) => {
                const rentId = makeAppEntities.owner_id
                res.redirect(`/makeAppointment/schedule-appointment/${rentId}`)
            })
        },

        async declined(req, res, next) {
            const { id } = req.params

            try {
                await MakeAppointment.findById(id).updateOne({ $set: { status: false, confirmStatus: false } }).lean().then((updateStatus) => {
                    console.log('updateStatus from declined 475', updateStatus)
                })
            } catch (error) {
                console.error(" Fail DECLINED command");
            }

            await MakeAppointment.findById(id).lean().then((makeAppEntities) => {
                const rentId = makeAppEntities.owner_id
                res.redirect(`/makeAppointment/schedule-appointment/${rentId}`)
            })
        },
    },
}
