const mongoose = require('mongoose')
const User = require('../users/User')
const { Schema, model: Model } = mongoose
const { String, Number, ObjectId } = Schema.Types

const rentSchema = new Schema({
    vehicleType: {
        type: String,
        required: true
    },

    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    constructionYear: {
        type: String,
        required: true
    },
    fuelType: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    carImage: {
        type: String,
        required: true
    },

    oldInputInformationAboutCarSpecifications: {
        type: Object,
        required: true
    },

    driver: {
        type: ObjectId,
        ref: 'User'
    },

    buddies: [{
        type: ObjectId,
        ref: 'User'
    }],
    
    makeAppointmentIds: [{
        type: ObjectId,
        ref: 'MakeAppointment'
    }]
})

module.exports = new Model('Rent', rentSchema)