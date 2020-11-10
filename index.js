require('./config/database')().then(() => {
    const config = require('./config/config')
    const app = require('express')()
    const appString = `Server is ready , listening on port- http://localhost:${config.port}/home`

    require('./config/express')(app)
    require('./config/routes')(app)

    app.listen(config.port , console.log(appString))
})