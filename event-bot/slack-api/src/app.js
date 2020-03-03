'use strict';
const fetch = require('node-fetch');

const secret = process.env.SLACK_SIGNING_SECRET || '1111111111111111111111111';
const botToken = process.env.SLACK_BOT_TOKEN || 'xoxb-werwer-werwer-werw-erwer-werwre';

const generateSuccessfulResponse = () =>{
     const responseBody = {
    };

    const response = {
        "statusCode": 200,
        "headers": {
        },
        "body": JSON.stringify(responseBody),
        "isBase64Encoded": false
    };
    return response;
}
// eventHandler.registerEvents(app);

exports.lambdaHandler = (event, context, callback) => {
  console.log(event);
  
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

  // Verification Token TODO: use signing secret and calculate hashes
  if (token && token !== payload.token)
    return context.fail("[401] Unauthorized");

  // Events API challenge
  if (payload.challenge)
    return callback(null, payload.challenge);
  else
    callback(null, generateSuccessfulResponse());

  // Ignore Bot Messages
  if (!(payload.event || payload).bot_id) {
    return;
  }

  const sayFunc = msg => {
    let body = {
      channel: slackEvent.channel,
      text: msg,
      token: botToken
    };

    fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + botToken
      },
      body: JSON.stringify(body)
    })
    .then(result => result.text())
    .then(text => console.log(text));
  };

  sayFunc('hello');

};
