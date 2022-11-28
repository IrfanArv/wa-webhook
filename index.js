require('dotenv').config()
var express = require('express'),
    app = express(),
    cors = require('cors'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    port = process.env.PORT

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var corsOption = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token'],
}

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept,  Authorization, x-api-key',
    )
    next()
})

var mainRoutes = require('./routes/index.routes')

app.use('/', mainRoutes)
app.use(cors(corsOption))

app.get('/', function (req, res) {
    res.send('OKE')
})

app.use('*', (req, res) => res.status(404).send('404 Not Found'))

app.listen(port, function () {
    console.log(`App is listening on port ${port}`)
})

module.exports = app
