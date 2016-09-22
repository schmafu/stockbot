# stockbot
Slack Integration for Displaying Stock Information

## Changelog

### 2.0

* moved to typescript

* less is more, the plotly integration has been removed. stockbot replies now with a single line of key values

## Configuration

A [Slack](https://api.slack.com/) slash-command and an incoming webhook must be configured.

**config.json**
```javascript
{
"slackToken":"secretToken",
"webHook":"https://hooks.slack.com/services/yourWebHook",
"port":4715,
"channel": "stocks",
"botName": "stockbot"
}
```

## Usage

create a config.json and run
```
npm install
npm start
```

users can display stock information with an appropriate slash command (eg. /stock aapl)

### Example Output

> Apple Inc.: *114.6*$ (+1%) Dividend: *2.0100%* - 52w: *89.5-123.8*$ -7.4110% below its 52 high   AAPL on google and yahoo


 
