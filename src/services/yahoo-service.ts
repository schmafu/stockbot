import {StockQuote} from "../models/yahoo-finance";
import {YahooServiceMapper} from "../mappers/yahoo-service-mapper";
import * as rp from "request-promise";

export class YahooService {
    private _urlPrefix = "http://query.yahooapis.com/v1/public/yql?q=";
    private _urlSuffix = "&format=json&diagnostics=true&env=http://datatables.org/alltables.env";
    
    fetchQuotes(symbol:string): Promise<StockQuote>{
        let url = this._urlPrefix + 
            encodeURIComponent(`select * from yahoo.finance.quotes where symbol in ('${symbol}')`) +
            this._urlSuffix;        
        return new Promise((resolve) => rp(url).then(data => resolve(YahooServiceMapper.mapToStockQuote(data))));        
    }   

}
