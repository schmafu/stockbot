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
        this.lastTradeDateTime = moment(args.lt).toDate();
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
}
exports.GoogleFinanceStockQuote = GoogleFinanceStockQuote;
//# sourceMappingURL=google-finance.js.map