require("dotenv").config();
var axios = require("axios"),
    WABA = process.env.URL_WABA,
    KEYWABA = process.env.KEY_WABA,
    NOWA = process.env.NO_WA;

module.exports = {
    started(req, res) {
        try {
            console.log("Incoming webhook: " + JSON.stringify(req.body));
            console.log(res.data);
            res.sendStatus(200).then(async () => {
                await axios({
                    method: "post",
                    url: `${WABA}v1/messages`,
                    headers: {
                        "D360-API-KEY": KEYWABA,
                    },
                    data: {
                        recipient_type: "individual",
                        to: NOWA,
                        type: "text",
                        text: {
                            body: "HELLO !",
                        },
                    },
                });
            });
        } catch (err) {
            console.error(err);
        }
    },
};
