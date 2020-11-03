const mongoose = require('mongoose')
const dbString = require('./config').dbUrl + 'TRIPPS'
const rdyString = `${'*'.repeat(10)}Database is Ready${'*'.repeat(10)}`

module.exports = () => {
    return mongoose.connect(dbString, {
        w: 'majority',  
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    },
        console.log(rdyString)
    )
}