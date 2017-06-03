"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_service_1 = require("./services/google-service");
const express = require("express");
const bodyParser = require("body-parser");
const slack = require("node-slack");
var config = require("../config");
const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.post("/stockquote", (req, res) => {
    if (req.body.token !== config.slackToken) {
        console.log("wrong token: " + req.body.token); // for testing purpose
        res.end();
        return;
    }
    /*
    let yahoo = new YahooService();
    yahoo.fetchQuotes(req.body.text).then(data => {
        let stockbot = new slack(config.webHook);
        stockbot.send({text:`${data.name || data.symbol}: *${data.priceS}*${data.currency} (${data.changeInPercentS}) Dividend: *${data.dividendYield}%* - 52w: *${data.yearLowS}-${data.yearHighS}*${data.currency} ${data.yearLowHighExplanation}   ${data.symbol.toUpperCase()} on <http://www.google.com/finance?q=${data.symbol}|google> and <http://finance.yahoo.com/quote/${data.symbol}|yahoo>`,
        channel:"aktien",
        username:"stockbot"});
        res.end();
    }); */
    let google = new google_service_1.GoogleService();
    google.fetchQuotes(req.body.text).then(data => {
        let stockbot = new slack(config.webHook);
        stockbot.send({ text: `${data.symbol}: *${data.lastTradePrice}*${data.currency} (${data.changePercent}), more infos: <http://www.google.com/finance?q=${data.symbol}|google> or <http://finance.yahoo.com/quote/${data.symbol}|yahoo>`,
            channel: "aktien",
            username: "stockbot" });
        res.end();
    });
});
app.listen(config.port);
//# sourceMappingURL=stockbot.js.map