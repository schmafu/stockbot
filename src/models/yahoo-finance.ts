export interface StockQuote {
    symbol:string;
    name:string;
    price:number;
    priceS:number;
    yearLow:number;
    yearHigh:number;
    yearLowS:number;
    yearHighS:number;     
    currency:string;
    marketCapitalization:string;
    ebitda:string;
    eps: number;
    changeInPercent:string;
    changeInPercentS:string;
    dividendYield:number;
    yearLowHighExplanation:string;
}