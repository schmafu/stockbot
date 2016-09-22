"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const slack = require("node-slack");
const yahoo_service_1 = require("./services/yahoo-service");
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
    let yahoo = new yahoo_service_1.YahooService();
    yahoo.fetchQuotes(req.body.text).then(data => {
        let stockbot = new slack(config.webHook);
        stockbot.send({ text: `${data.name || data.symbol}: *${data.priceS}*${data.currency} (${data.changeInPercentS}) Dividend: *${data.dividendYield}%* - 52w: *${data.yearLowS}-${data.yearHighS}*${data.currency} ${data.yearLowHighExplanation}   ${data.symbol.toUpperCase()} on <http://www.google.com/finance?q=${data.symbol}|google> and <http://finance.yahoo.com/quote/${data.symbol}|yahoo>`,
            channel: "aktien",
            username: "stockbot" });
        res.end();
    });
});
app.listen(config.port);
//# sourceMappingURL=stockbot.js.map