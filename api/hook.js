require('dotenv').config()
var axios = require('axios'),
    WABA = process.env.URL_WABA,
    KEYWABA = process.env.KEY_WABA,
    NOWA = process.env.NO_WA

module.exports = {
    async started(req, res) {
        try {
            console.log('Incoming webhook: ' + JSON.stringify(req.body))
            console.log(res.data)
            await axios({
                method: 'post',
                url: `${WABA}v1/messages`,
                headers: {
                    'D360-API-KEY': KEYWABA,
                },
                data: {
                    recipient_type: 'individual',
                    to: NOWA,
                    type: 'text',
                    text: {
                        body: 'HELLO !',
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
            response.sendStatus(200)
        } catch (err) {
            console.error(err)
        }
    },
}
