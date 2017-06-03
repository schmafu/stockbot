import * as moment from "moment";

export class GoogleFinanceStockQuote {
    id: number;
    symbol: string; // "AAPL"
    index: string; // "NASDAQ"
    lastTradePrice: number; // 123.45
    lastTradeDateTime: Date; // "Jun 2, 4:00PM EDT", moment should parse it
    changeAbsolute: number;
    changePercent: number;
    previousClosePrice: number;

    constructor(response:string) {
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

    sanitizeResponse(data:string): Array<GoogleFinanceStockQuote.Response> {
        return JSON.parse(data.slice(3));
    }

    // should cover most use cases
    get currency(): string {
        return this.index == "NASDAQ" || this.index == "NYSE" ? "$" : "€";
    }
    get prettyChangePercent(): string {
        return this.changePercent > 0 ? "+" + this.changePercent + "%" : this.changePercent + "%";
    }
}

export module GoogleFinanceStockQuote {
    export interface Response {
        id: string;
        t: string;
        e: string;
        l: string;
        l_fix: string;
        l_cur: string;
        s: string;
        ltt: string;
        lt: string;
        lt_dts: string;
        c: string;
        c_fix: string;
        cp: string;
        cp_fix: string;
        ccol: string;
        pcls_fix: string;
    }
}
