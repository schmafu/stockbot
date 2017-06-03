"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const rp = require("request-promise");
class GoogleService {
    constructor() {
        this._urlPrefix = "http://finance.google.com/finance/info?q=";
    }
    fetchQuotes(symbol) {
        return new Promise((resolve) => rp(this._urlPrefix + symbol)
            .then(data => resolve(new models_1.GoogleFinanceStockQuote(data))));
    }
}
exports.GoogleService = GoogleService;
//# sourceMappingURL=google-service.js.map