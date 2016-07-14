import * as express from "express";
import * as bodyParser from "body-parser";
import * as slack from "node-slack";

import {YahooService} from "./services/yahoo-service";
import {StockQuote} from "./models/yahoo-finance";

var config = require("../config");

/*
class StockBot {
    app:express.Application;
    
    constructor() {
        this.app = express();        
    }
    
    public static bootstrap(): StockBot {
        return new StockBot();
    }

}*/

const app = express();
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


app.post("/stockquote", (req,res) => {
    if (req.body.token !== config.slackToken) {
        console.log("wrong token: " + req.body.token); // for testing purpose
        return
    }
    let yahoo = new YahooService();
    yahoo.fetchQuotes(req.body.text).then(data => {
        let stockbot = new slack(config.webHook);
        stockbot.send({text:`${data.name || data.symbol}: *${data.priceS}*${data.currency} (${data.changeInPercentS}) Dividend: *${data.dividendYield}%* - 52w: *${data.yearLowS}-${data.yearHighS}*${data.currency} ${data.yearLowHighExplanation}   ${data.symbol.toUpperCase()} on <http://www.google.com/finance?q=${data.symbol}|google> and <http://finance.yahoo.com/quote/${data.symbol}|yahoo>`,
        channel:"aktien",
        username:"stockbot"});
        res.end();
        //res.json(data);
    })    
});
app.listen(4715);

