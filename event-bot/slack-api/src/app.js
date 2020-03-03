'use strict';

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

const makeAppWithToken = (token, expressReceiver) => {
  return new App({
    token: token,
    receiver: expressReceiver
  });
}

const makeAppWithOauth = expressReceiver => {
  const oauth = { auth:""}; //require('./lib/oauth');
  console.log('doing this');
  const app = new App({
    authorize: oauth.auth,
    receiver: expressReceiver
  });

  oauth.install(expressReceiver.app, app.client);

  return app;
}

const useAuth = (process.env.USE_OAUTH || false);
const app = useAuth ?
  makeAppWithOauth(expressReceiver) :
  makeAppWithToken(botToken, expressReceiver);

eventHandler.registerEvents(app);

module.exports.lambdaHandler = require('serverless-http')(expressReceiver.app);
