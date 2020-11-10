const { body } = require('express-validator')

module.exports = [
    // body('directions')
    //     .custom((value) => {
    //         if (!value.includes(' - ')) {
    //             throw new Error('The directions input field should includes " - " betweeen the start point and end point')
    //         }

    //         return true
    //     }),

    // body('dateStart')
    //     .custom((value) => {
    //         if (!value.includes(' - ')) {
    //             throw new Error('The dateTime input field should includes " - " betweeen the date point and time')
    //         }

    //         return true
    //     }) , 

    // body('dateEnd')
    //     .custom((value) => {
    //         if (!value.includes(' - ')) {
    //             throw new Error('The dateTime input field should includes " - " betweeen the date point and time')
    //         }

    //         return true
    //     }) , 

]