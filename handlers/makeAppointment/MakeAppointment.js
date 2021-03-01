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


    client: {
        type: ObjectId,
        ref: 'Rent'
    },

    driver: {
        type: ObjectId,
        ref: 'User'
    },

    buddies: [{
        type: ObjectId,
        ref: 'User'
    }]

})

module.exports = new Model('MakeAppointment', makeAppointmentSchema)