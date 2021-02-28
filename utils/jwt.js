const jwt = require('jsonwebtoken')
const { secret } = require('../config/config')

module.exports = {
    createToken(data) {
        return jwt.sign({ _id: data._id }, secret, { expiresIn: '3h' })
    },

    verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, data) => {
                if (err) {
                    reject(err)
                    return
                }
                return resolve(data)
            })
        })
    }
}