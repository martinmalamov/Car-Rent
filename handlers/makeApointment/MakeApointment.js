const mongoose = require('mongoose')
const User = require('../users/User')
const { Schema, model: Model } = mongoose
const { String, Number, ObjectId } = Schema.Types

const makeApointment = new Schema({
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

    driver: {
        type: ObjectId,
        ref: 'User'
    },

    buddies: [{
        type: ObjectId,
        ref: 'User'
    }]

})

module.exports = new Model('MakeApointment', makeApointment)