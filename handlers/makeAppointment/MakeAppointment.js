const mongoose = require('mongoose')
const User = require('../users/User')
const { Schema, model: Model } = mongoose
const { String, Number, ObjectId } = Schema.Types

const makeAppointmentSchema = new Schema({
    dateStart: {
        type: String
    },
    dateEnd: {
        type: String
    },
    startRentTime: {
        type: String
    },
    endRentTime: {
        type: String
    },

    fullName: {
        type: String,
    },
    status: {
        type: Boolean,
    },
    confirmStatus: {
        type: Boolean,
    },
    
    statusResult: {
        type: String,
    },


    enrolledCustomers: [{
        type: ObjectId,
        ref: 'User'
    }],

    owner_id: {
        type: ObjectId,
        ref: 'Rent'
    },

})

module.exports = new Model('MakeAppointment', makeAppointmentSchema)