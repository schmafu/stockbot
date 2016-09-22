import {YahooService} from "./services/yahoo-service";

let ys = new YahooService();

ys.fetchQuotes("AAPL").then(data => {
    console.log(data);
    console.log("data-ende");
});
console.log("waiting...");


