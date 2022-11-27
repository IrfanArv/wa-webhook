require('dotenv').config()
var axios = require('axios')
var WABA = process.env.URL_WABA
var KEYWABA = process.env.KEY_WABA

module.exports = {
    async main(req, res) {
        try {
            await axios({
                method: 'post',
                url: `${WABA}v1/messages`,
                headers: {
                    'D360-API-KEY': KEYWABA,
                },
                data: {
                    recipient_type: 'individual',
                    to: req.body.no_wa,
                    type: 'interactive',
                    interactive: {
                        type: 'button',
                        body: {
                            text: 'Hallo, Mau ngapain ?',
                        },
                        action: {
                            buttons: [
                                {
                                    type: 'reply',
                                    reply: {
                                        id: '1',
                                        title: 'Engga ngapa2in',
                                    },
                                },
                                {
                                    type: 'reply',
                                    reply: {
                                        id: '2',
                                        title: 'Belanja dong!',
                                    },
                                },
                            ],
                        },
                    },
                },
            }).then(() => {
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
