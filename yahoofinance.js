'use strict';

var request = require('request');

module.exports = function(symbol, callback) {
  var url = 'http://query.yahooapis.com/v1/public/yql?q=' +
            encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')") +
            "&format=json&diagnostics=true&env=http://datatables.org/alltables.env";

  request(url, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      callback(null);
      return;
    }

    var res = JSON.parse(body);
    if (res.query.results.quote.Name) {
      callback(res.query.results.quote);
    } else {
      callback(null);
    }
  });
};
