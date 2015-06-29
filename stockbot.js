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


app.post('/stockquote', function (req, res) {
    if (req.body.token !== config.slackToken) {
         // console.log("wrong token: " + req.body.token); // for testing purpose
        return
    }

    //  fetch stockinfos from yahoofinance (table quotes)
    var getStock = new Promise(function (resolve, reject) {
        yf(req.body.text, function (data) {
            if (!data) {
                reject("could not fetch stock quote for " + req.body.text);
                return;
            }
            resolve(data);

        })
    });
    // fetch 52w daily close 
    var getStockHistory = new Promise(function (resolve, reject) {
        yfh(req.body.text, function (data) {
            if (!data) {
                reject("could not fetch historical stock data for " + req.body.text);
                return;
            }
            resolve(data);
        })
    });


    // draw the plot.ly plot, user/token required. calculates the 2 simple moving averages
    // smashort and smalong - if they are not configured, calculate them anyway
    function drawPlot(data) {
        return new Promise(function (resolve, reject) {
            var x = [];
            var y = [];
            var yshort = [];
            var ylong = [];
            
            var smashort = (config.hasOwnProperty('smashort'))?parseInt(config.smashort):50;
            var smalong = (config.hasOwnProperty('smalong'))?parseInt(config.smalong):200;
            data[1].forEach(function (e, i) {

                x.push(e.Date);
                y.push(Math.round(Number(e.Close)*10)/10);
                if (i === 0) {
                    yshort.push(Math.round(Number(e.Close)*10)/10);
                    ylong.push(Math.round(Number(e.Close)*10)/10);

                    return;
                }
                if(y.length < smashort)
                    yshort.push(Math.round(Number(y.reduce(function(prev,curr) {return prev+curr;})/ y.length)*10)/10);
                else
                    yshort.push(Math.round(Number(y.reduce(function(prev,curr,index,array) {
                        if(index < array.length - smashort)
                            return 0;
                        return prev+curr;
                    })/smashort)*10)/10);

                if(y.length < smalong)
                    ylong.push(Math.round(Number(y.reduce(function(prev,curr) {return prev+curr;})/ y.length)*10)/10);
                else
                    ylong.push(Math.round(Number(y.reduce(function(prev,curr,index,array) {
                                    if(index < array.length - smalong)
                                        return 0;
                                    return prev+curr;
                                })/smalong)*10)/10);


                 // console.log("" + i + " e: " + e.Date + " y50: " + yshort[i]);
            });



            var plotdata = [
                {
                    "x": x.slice(149),
                    "y": y.slice(149),
                    "name": "Stock Price",
                    "line":{"width":2},
                    "type": "scatter"
                }];
            if(config.hasOwnProperty('smashort')) plotdata.push({
                    "x": x.slice(149),
                    "y":yshort.slice(149),
                    "name": "" + smashort + " Days SMA",
                    "mode":"lines",
                    "line":{"color":"rgb(120,40,40)", "shape":"spline", "width":0.5},
                    "opacity":0.5,
                    "type": "scatter"
                });
            if(config.hasOwnProperty('smalong')) plotdata.push({
                    "x": x.slice(149),
                    "y":ylong.slice(149),
                    "name": "" + smalong + " Days SMA",
                    "mode":"lines",
                    "line":{"color":"rgb(40,120,40)", "shape":"spline", width:0.5},
                    "opacity":0.5,
                    "type": "scatter"
                });


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
