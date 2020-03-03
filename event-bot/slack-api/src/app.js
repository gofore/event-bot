'use strict';

if (process.env.NODE_ENV !== 'production') {
  const dotEnv = require('dotenv');
  dotEnv.config({path:'.env'});
}

const { App, ExpressReceiver } = require("@slack/bolt");
const eventHandler = require('./eventHandling.js');
const fetch = require('node-fetch');

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

module.exports.lambdaHandler = (event, context, callback) => {
  let payload = event.body;
  let id;
  let token = process.env.VERIFICATION_TOKEN;

  // Interactive Messages
  if (payload.payload) {
    payload = JSON.parse(payload.payload);
  }
  else{
    payload = JSON.parse(payload);
    
  }

  const slackEvent = payload.event;
  id = payload.team_id;
  console.log(payload);
  console.log(slackEvent);

  // Verification Token TODO: use signing secret and calculate hashes
  if (token && token !== payload.token)
    return context.fail("[401] Unauthorized");

  // Events API challenge
  if (payload.challenge)
    return callback(null, payload.challenge);
  else
    callback();

  // Ignore Bot Messages
  if (!(payload.event || payload).bot_id) {
    return;
  }

  const sayFunc = msg => {
    let body = {
      channel: "DUMANHCQL",
      text: msg
    };

    fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + botToken
      },
      body: JSON.stringify(body)
    });
  };

  sayFunc('hello');

};
