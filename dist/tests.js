"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yahoo_service_1 = require("./services/yahoo-service");
let ys = new yahoo_service_1.YahooService();
ys.fetchQuotes("AAPL").then(data => {
    console.log(data);
    console.log("data-ende");
});
console.log("waiting...");
//# sourceMappingURL=tests.js.map