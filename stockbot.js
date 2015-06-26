'use strict';

var config = require('./config.js')
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var slack = require('slack-notify')(config.slackHook);
var plotly = require('plotly')(config.plotlyUser, config.plotlyToken);

var yfh = require('./yahoofinancehistory.js')
var yf = require('./yahoofinance.js');

// node < 0.12
//var Promise = require('promise');


var http = require('http');
//var url = require('url');
//var querystring = require('querystring');
// SMA var MA = require('moving-average');

// post
// https://hooks.slack.com/services/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

// kXyQoLVMlW1P3na3hdJf30VT
app.post('/stockquote', function (req, res) {
    if(req.body.token !== config.slackToken) {
        console.log("falscher token"); // für die finale version nichts loggen
        return
    }

    // allgemeine stockinfos über yahoofinance holen
    var getStock = new Promise(function(resolve, reject) {
        yf(req.body.text,function(data) {
            if(!data) {
                reject();
                return;
            }
            resolve(data);

        })});
    // die tagesschlusskurse der letzten 52 wochen über yahoofinance holen
    var getStockHistory = new Promise(function(resolve, reject) {
        yfh(req.body.text, function(data) {
            if(!data) {
                reject();
                return;
            }
            resolve(data);
        })
    });


    // zeichnet den plot auf plot.ly, user/token müssen in der config angegeben
    // werden; TODO: SMA50 und SMA200 einzeichnen
    function drawPlot(data) {
        return new Promise(function(resolve, reject) {

       //for(var i = data.length; i > 0; i--)
            var x = [];
            var y = [];
        //SMA50    var y50 = [];
        //SMA200    var y200 = [];
            data[1].forEach(function(e,i) {
                //console.log("" + i + "  " + e);
                x.unshift(e.Date);
                y.unshift(e.Close);
            });


        //SMA50    var ma50 = MA(50*24*60*60*1000);
        //SMA200    var ma200 = MA(200*24*60*60*1000);

        /* SMA    x.forEach(function(e,i) {
                var iDate = new Date( e.substring(0,4), e.substring(5,7)-1,e.substring(8,10));
                ma50.push(iDate,(i !== 0)? y[i-1] : y[i] );
                ma200.push(iDate,(i !== 0)? y[i-1] : y[i] );
                y50[i] = ma50.movingAverage();
                console.log("" + i + iDate.toString() + "  " + ma50.movingAverage());
                y200[i] = ma200.movingAverage();
            }) */

            var plotdata = [
                {
                    "x":x,
                    "y":y,
                    "type": "scatter"
                }];
            /* SMA ,
                {
                    "x":x,
                    "y":y50,
                    "mode":"lines",
                    "line":{"color":"rgb(220,40,40)", "shape":"spline", "dash":"dot"},
                    "type": "scatter"
                },
                {
                    "x":x,
                    "y":y200,
                    "mode":"lines",
                    "line":{"color":"rgb(220,40,40)", "shape":"spline", "dash":"dash"},
                    "type": "scatter"
                }
            ]; */

            var layout = {
                title: "Aktienkurs von " + data[0].Name,
                yaxis: {title: "Kurs in " + data[0].Currency},
                xaxis: {title: "Zeitraum"}
            }

            console.log(layout);
            console.log("body text: " + req.body.text)
            var graphOptions = {filename: req.body.text, layout: layout, fileopt: "overwrite"};

            plotly.plot(plotdata, graphOptions, function (err, msg) {
                if(err) {reject("plotly fail");}
                data.push(msg);
                resolve(data);
            });
	        });

    }







   /* handling auf bmw.de ticker
    if(symbol.lastIndexOf("/") != -1) {
        symbol = symbol.substr(symbol.lastIndexOf("/"));
    } */


    Promise.all([getStock, getStockHistory]).then(drawPlot).then(function(data) {
        if(!data) return new Error("Keine Daten");
        console.log("bin im done");
          var attachments = [];
          var attachment = {};
          attachment.fallback = "" + data[0].Name + " " +
                                     data[0].Currency + " " +
                                     data[0].LastTradePriceOnly;
          attachment.color = "good";
          attachment.title = "Aktienkurs für " + data[0].Name;
          attachment.fields = [{
              title : "Kurs in " + data[0].Currency,
              value : "" + data[0].LastTradePriceOnly,
              short : true
          }, {
              title : "Veränderung zum Vortag",
              value : "" + data[0].PercentChange,
              short : true
          }, {
                  title : "Marktkapitalisierung",
                  value : "" + data[0].MarketCapitalization,
                  short : true
          }, {
                      title : "Dividendenrendite in %",
                      value : "" + data[0].DividendYield,
                      short : true
          }, {
            title : "Kursbereich in den letzten 52 Wochen:",
            value : "" + data[0].YearRange,
            short : false
        }];
          attachment.title_link = data[2].url;
          attachment.image_url = "" + data[2].url + ".png";

          attachments.push(attachment);
          //console.log("attachments:");
          //console.log(attachments);
        slack.send({
         username: 'stockbot',
         icon_emoji: ':heavy_dollar_sign:',
         channel: req.body.channel_id,
         text: '_' + req.body.command + ' ' + req.body.text + '_',
         "attachments": attachments
     });
     res.send();
    }).catch(function(e) {
    console.log("[ERROR] " + e);
    res.status(404).send("Fehler: " + e);
  });
});


var server = app.listen(config.port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Stockbot listening at http://%s:%s', host, port)

});
