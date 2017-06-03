import { GoogleFinanceStockQuote } from "../models";
import * as rp from "request-promise";

export class GoogleService {
    private _urlPrefix = "http://finance.google.com/finance/info?q=";

    fetchQuotes(symbol: string): Promise<GoogleFinanceStockQuote> {
        return new Promise((resolve) => rp(this._urlPrefix + symbol)
            .then(data => resolve(new GoogleFinanceStockQuote(data))));
    }
}
