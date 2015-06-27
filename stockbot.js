'use strict';

var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var slack = require('slack-notify')(config.slackHook);
var plotly = require('plotly')(config.plotlyUser, config.plotlyToken);

var yfh = require('./yahoofinancehistory.js');
var yf = require('./yahoofinance.js');

// node < 0.12
//var Promise = require('promise');


// SMA var MA = require('moving-average');

app.post('/stockquote', function (req, res) {
    if (req.body.token !== config.slackToken) {
          console.log("falscher token: " + req.body.token); // für die finale version nichts loggen
        return
    }

    // allgemeine stockinfos über yahoofinance holen
    var getStock = new Promise(function (resolve, reject) {
        yf(req.body.text, function (data) {
            if (!data) {
                reject("could not fetch stock quote for " + req.body.text);
                return;
            }
            resolve(data);

        })
    });
    // die tagesschlusskurse der letzten 52 wochen über yahoofinance holen
    var getStockHistory = new Promise(function (resolve, reject) {
        yfh(req.body.text, function (data) {
            if (!data) {
                reject("could not fetch historical stock data for " + req.body.text);
                return;
            }
            resolve(data);
        })
    });


    // zeichnet den plot auf plot.ly, user/token müssen in der config angegeben
    // werden; TODO: SMA50 und SMA200 einzeichnen
    function drawPlot(data) {
        return new Promise(function (resolve, reject) {
            console.log("im DrawPlot");
            //for(var i = data.length; i > 0; i--)
            var x = [];
            var y = [];
            var yshort = [];
            var ylong = [];
            data[1].forEach(function (e, i) {

                x.push(e.Date);
                y.push(Math.round(Number(e.Close)*10)/10);
                if (i === 0) {
                    yshort.push(Math.round(Number(e.Close)*10)/10);
                    ylong.push(Math.round(Number(e.Close)*10)/10);

                    return;
                }
                if(y.length < 50)
                    yshort.push(Math.round(Number(y.reduce(function(prev,curr) {return prev+curr;})/ y.length)*10)/10);
                else
                    yshort.push(Math.round(Number(y.reduce(function(prev,curr,index,array) {
                        if(index < array.length - 50)
                            return 0;
                        return prev+curr;
                    })/50)*10)/10);

                if(y.length < 200)
                    ylong.push(Math.round(Number(y.reduce(function(prev,curr) {return prev+curr;})/ y.length)*10)/10);
                else
                    ylong.push(Math.round(Number(y.reduce(function(prev,curr,index,array) {
                                    if(index < array.length - 200)
                                        return 0;
                                    return prev+curr;
                                })/200)*10)/10);


                 // console.log("" + i + " e: " + e.Date + " y50: " + yshort[i]);
            });



            var plotdata = [
                {
                    "x": x.slice(149),
                    "y": y.slice(149),
                    "name": "Stock Price",
                    "line":{"width":2},
                    "type": "scatter"
                },{
                    "x": x.slice(149),
                    "y":yshort.slice(149),
                    "name": "50 Days SMA",
                    "mode":"lines",
                    "line":{"color":"rgb(120,40,40)", "shape":"spline", "width":0.5},
                    "opacity":0.5,
                    "type": "scatter"
                },    {
                    "x": x.slice(149),
                    "y":ylong.slice(149),
                    "name": "200 Days SMA",
                    "mode":"lines",
                    "line":{"color":"rgb(40,120,40)", "shape":"spline", width:0.5},
                    "opacity":0.5,
                    "type": "scatter"
                }];


            var layout = {
                title: "Stock Chart for " + data[0].Name,
                yaxis: {title: "Price in " + data[0].Currency},
                xaxis: {title: "Time"}
            };

            var graphOptions = {filename: req.body.text, layout: layout, fileopt: "overwrite"};

            plotly.plot(plotdata, graphOptions, function (err, msg) {
                if (err) {
                    reject("plot.ly returned an error: + " + err);
                }
                data.push(msg);
                //console.log("plotly: " + msg);
                resolve(data);
            });
        });

    }


    /* handling auf bmw.de ticker
     if(symbol.lastIndexOf("/") != -1) {
     symbol = symbol.substr(symbol.lastIndexOf("/"));
     } */


    Promise.all([getStock, getStockHistory]).then(drawPlot, function(reason) {throw reason;}).then(function (data) {
        if (!data) throw ("Something went terrible wrong!");
        //console.log("bin im done");
        var attachments = [];
        var attachment = {};
        var currencySymbol = data[0].Currency;

        var dividendYield = data[0].DividendYield;

        if (dividendYield === null) dividendYield = "n/a";
        else dividendYield += " %";

        if(data[0].Currency === "USD") currencySymbol = "$";
        if(data[0].Currency === "EUR") currencySymbol = "€";



        attachment.fallback = "" + data[0].Name + " " +
            data[0].Currency + " " +
            data[0].LastTradePriceOnly;
        attachment.color = "#1f77b4";
        attachment.title = "" + data[0].Name;
        attachment.fields = [{
            title: "Stock Price:",
            value: currencySymbol + " " + data[0].LastTradePriceOnly + "(" + data[0].PercentChange + ")" ,
            short: true
        }, {
            title: "P/E",
            value: data[0].PERatio,
            short: true
        }, {
            title: "Market Cap.",
            value: currencySymbol + " " + data[0].MarketCapitalization,
            short: true
        }, {
            title: "EBITDA",
            value: data[0].EBITDA,
            short: true
        }, {
            title: "EPS",
            value: currencySymbol + " " + data[0].EarningsShare,
            short: true
        },  {
            title: "Div. Yield",
            value: dividendYield,
            short: true
        },{
            title: "52 Week Range:",
            value: data[0].YearRange,
            short: false
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
    }).catch(function (e) {
        console.log("[ERROR] " + e);
        res.status(404).send("Error: " + e);
    });
});


var server = app.listen(config.port, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Stockbot listening at http://%s:%s', host, port)

});
