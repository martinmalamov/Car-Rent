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
    // dateStart : {
    //     type: String
    // } , 
    // dateEnd : {
    //     type: String
    // } , 
    // time : {
    //     type: String
    // } , 
    seats: {
        type: Number,
        //required: true
    },
    price: {
        type: String,
        required: true
    },
    carImage: {
        type: String,
        required: true
    },

    attributeArrayOfValues: {
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
    }]

})

module.exports = new Model('Rent', rentSchema)