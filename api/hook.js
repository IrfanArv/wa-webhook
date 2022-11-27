require('dotenv').config()
var axios = require('axios')
var WABA = process.env.URL_WABA
var KEYWABA = process.env.KEY_WABA

module.exports = {
    main(req, res) {
        try {
            let res = JSON.stringify(req.body)
            console.log(res)
            axios({
                method: 'post',
                url: `${WABA}v1/messages`,
                headers: {
                    'D360-API-KEY': KEYWABA,
                },
                data: {
                    recipient_type: 'individual',
                    to: '682116982479',
                    type: 'text',
                    text: {
                        body: 'Walah ngapain chat sini kalo gitu!',
                    },
                },
            })
                // let data = JSON.parse(res)
                // let buttonReplay = data.messages[0].interactive.button_reply.id
                // if ((buttonReplay = 1)) {
                //     console.log('Beli')
                // }
                // if ((buttonReplay = 2)) {
                //     console.log('Engga Beli')
                // }
                .then(() => {
                    const response = {
                        status: 200,
                        success: true,
                        message: 'Terkirim',
                    }
                    return res.status(200).send(response)
                })
        } catch (err) {
            let response = {
                status: 400,
                success: false,
                message: 'Bad request',
                data: {
                    errors: err.message,
                },
            }
            return res.status(400).send(response)
        }
    },
}
