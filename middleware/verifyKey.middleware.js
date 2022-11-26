module.exports = function (req, res, next) {
    const keyHeader = req.headers['x-api-key']
    const apiKey = process.env.API_KEY

    if (!keyHeader) {
        const response = {
            auth: false,
            status: 403,
            success: false,
            message: 'No Key provided',
        }
        return res.status(403).send(response)
    }

    if (keyHeader !== apiKey) {
        return res.status(401).send({
            auth: false,
            message: "Key doesn't match",
        })
    }
    next()
}
