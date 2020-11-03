const mongoose = require('mongoose')
const User = require('../users/User')
const { Schema, model: Model } = mongoose
const { String, Number, ObjectId } = Schema.Types

const rentSchema = new Schema({
    vehicleType: {
        type: String
    },
    
    brand : {
        type: String
    } , 
    model : {
        type: String
    } ,
    constructionYear :{
        type:String
    } ,
    fuelType :{
        type:String
    } ,
    dateStart : {
        type: String
    } , 
    dateEnd : {
        type: String
    } , 
    time : {
        type: String
    } , 
    seats : {
        type: Number
    } , 
    price : {
        type: String
    } , 
    carImage : {
        type: String
    } , 

    driver: {
        type: ObjectId , 
        ref : 'User'
    }, 
    
    buddies : [{
        type: ObjectId , 
        ref: 'User'
    }] 
    
})

module.exports = new Model('Rent', rentSchema)