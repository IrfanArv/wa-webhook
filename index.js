var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    axios = require('axios'),
    port = process.env.PORT

var axios = require('axios')
var WABA = process.env.URL_WABA
var KEYWABA = process.env.KEY_WABA
var NOWA = process.env.NO_WA

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send('OKE')
})

app.post('/webhook', function (request, response) {
    let res = JSON.stringify(request.body)
    let data = JSON.parse(res)

    response.sendStatus(200)
})

app.listen(port, function () {
    console.log(`App is listening on port ${port}`)
})

module.exports = app
