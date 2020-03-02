if (process.env.NODE_ENV !== 'production') {
  const dotEnv = require('dotenv');
  dotEnv.config({path:'.env'});
}

const { App, ExpressReceiver } = require("@slack/bolt");
const eventHandler = require('./eventHandling.js');

const secret = process.env.SLACK_SIGNING_SECRET || '1111111111111111111111111';
const botToken = process.env.SLACK_BOT_TOKEN || 'xoxb-werwer-werwer-werw-erwer-werwre';

const expressReceiver = new ExpressReceiver({
  signingSecret: secret
});

const app = new App({
  token: botToken,
  receiver: expressReceiver
});

eventHandler.registerEvents(app);

// ------------------------
// AWS Lambda handler
// ------------------------
const awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(expressReceiver.app);

module.exports.lambdaHandler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
}