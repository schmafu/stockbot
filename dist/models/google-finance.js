"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
class GoogleFinanceStockQuote {
    constructor(response) {
        let args = this.sanitizeResponse(response)[0];
        this.id = +args.id;
        this.symbol = args.t;
        this.index = args.e;
        this.lastTradePrice = parseFloat(args.l);
        this.lastTradeDateTime = moment(args.lt, "MMM D, h:mmA").toDate(); // needs fixing
        this.changeAbsolute = parseFloat(args.c);
        this.changePercent = parseFloat(args.cp);
        this.previousClosePrice = parseFloat(args.pcls_fix);
    }
    sanitizeResponse(data) {
        return JSON.parse(data.slice(3));
    }
    // should cover most use cases
    get currency() {
        return this.index == "NASDAQ" || this.index == "NYSE" ? "$" : "€";
    }
    get prettyChangePercent() {
        return this.changePercent > 0 ? "+" + this.changePercent + "%" : this.changePercent + "%";
    }
}
exports.GoogleFinanceStockQuote = GoogleFinanceStockQuote;
//# sourceMappingURL=google-finance.js.map