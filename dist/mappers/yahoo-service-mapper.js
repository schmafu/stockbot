"use strict";
class YahooServiceMapper {
    static mapToStockQuote(jsonString) {
        let data = JSON.parse(jsonString);
        if (data && data.query && data.query.results && data.query.results.quote) {
            let quote = data.query.results.quote;
            return {
                symbol: quote.Symbol,
                name: quote.Name,
                price: parseFloat(quote.LastTradePriceOnly),
                priceS: Math.round(parseFloat(quote.LastTradePriceOnly) * 10) / 10,
                yearLow: parseFloat(quote.YearLow),
                yearLowS: Math.round(parseFloat(quote.YearLow) * 10) / 10,
                yearHigh: parseFloat(quote.YearHigh),
                yearHighS: Math.round(parseFloat(quote.YearHigh) * 10) / 10,
                currency: this.mapToCurrencySymbol(quote.Currency),
                marketCapitalization: quote.MarketCapitalization,
                ebitda: quote.EBITDA,
                eps: parseFloat(quote.EarningsShare),
                changeInPercent: quote.ChangeinPercent,
                changeInPercentS: this.beautifyPercent(quote.ChangeinPercent),
                dividendYield: quote.DividendYield,
                yearLowHighExplanation: this.explanation(quote.PercentChangeFromYearLow, quote.PercebtChangeFromYearHigh)
            };
        }
        return null;
    }
    static mapToCurrencySymbol(currency) {
        switch (currency) {
            case "USD": return "$";
            case "EUR": return "€";
            case "GBP": return "£";
            default: return currency;
        }
    }
    static beautifyPercent(change) {
        if (change[0] != '+' && change[0] != '-') {
            return change;
        }
        return `${change[0]}${Math.round(parseFloat(change.slice(1, -1)) * 10) / 10}%`;
    }
    static explanation(low, high) {
        let lown = parseFloat(low.slice(1, -1));
        let highn = parseFloat(high.slice(1, -1));
        if (Math.abs(lown - highn) < 10) {
            return "";
        }
        if (lown < highn) {
            return `${low} above its 52w low`;
        }
        return `${high} below its 52 high`;
    }
}
exports.YahooServiceMapper = YahooServiceMapper;
//# sourceMappingURL=yahoo-service-mapper.js.map