const endChat = require('./endChat')

module.exports = {
    async main(req, res) {
        try {
            let res = JSON.stringify(req.body)
            console.log(res)
            endChat()
            // let data = JSON.parse(res)
            // let buttonReplay = data.messages[0].interactive.button_reply.id
            // if ((buttonReplay = 1)) {
            //     console.log('Beli')
            // }
            // if ((buttonReplay = 2)) {
            //     console.log('Engga Beli')
            // }
            res.sendStatus(200)
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
