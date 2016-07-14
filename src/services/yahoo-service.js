"use strict";
const yahoo_service_mapper_1 = require("../mappers/yahoo-service-mapper");
const rp = require("request-promise");
class YahooService {
    constructor() {
        this._urlPrefix = "http://query.yahooapis.com/v1/public/yql?q=";
        this._urlSuffix = "&format=json&diagnostics=true&env=http://datatables.org/alltables.env";
    }
    fetchQuotes(symbol) {
        let url = this._urlPrefix +
            encodeURIComponent(`select * from yahoo.finance.quotes where symbol in ('${symbol}')`) +
            this._urlSuffix;
        return new Promise((resolve) => rp(url).then(data => resolve(yahoo_service_mapper_1.YahooServiceMapper.mapToStockQuote(data))));
    }
}
exports.YahooService = YahooService;
//# sourceMappingURL=yahoo-service.js.map