'use strict';

var request = require('request');

module.exports = function(symbol, callback) {
  function pad(n){return n<10 ? '0'+n : n}
  var d = new Date();
  var month = (d.getMonth() === 0)? 1: d.getMonth();
  var day = (d.getDate() > 28)? 28: d.getDate();
    var url = 'http://query.yahooapis.com/v1/public/yql?q=' +
            encodeURIComponent('select Date,Close from yahoo.finance.historicaldata where symbol ="' + symbol +
             '" and startDate="' + (d.getFullYear()-1) + "-" + pad(month) + "-" + pad(day) +
             '" and endDate="' + (d.getFullYear()) + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate())) +
             '"| sort(field="Date")' +
            '&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';

  request(url, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      callback(null);
      return;
    }
    var res = JSON.parse(body);
    if (res.query.results !== null) {
      callback(res.query.results.quote);
    } else {
      callback(null);
    }
  });
};
