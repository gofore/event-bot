const { App, ExpressReceiver } = require("@slack/bolt");
const eventHandler = require('./eventHandling.js');

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
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