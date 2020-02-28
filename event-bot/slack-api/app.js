const { App } = require("@slack/bolt");
const eventHandler = require('./eventHandling.js.js');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

eventHandler.registerEvents(app);

// ------------------------
// AWS Lambda handler
// ------------------------
const awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(expressReceiver.app);

module.exports.app = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
}
