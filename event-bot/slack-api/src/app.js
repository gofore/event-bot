'use strict';

const AWS = require('aws-sdk');
const { handleEvents, handleActions } = require('./eventHandling');
const querystring = require('querystring');

const secret = process.env.SLACK_SIGNING_SECRET || '1111111111111111111111111';
const botToken = process.env.SLACK_BOT_TOKEN || 'xoxb-werwer-werwer-werw-erwer-werwre';
const verificationToken = process.env.VERIFICATION_TOKEN;

module.exports.lambdaHandler = async (data) => {
  if(process.env.DEBUG_LOGS){
    console.log(data);
  }
  
  let dataObject;
  if (data.body.includes('payload=')) {
    dataObject = JSON.parse(querystring.parse(data.body).payload);
  }
  else {
    dataObject = JSON.parse(data.body);
  }

  

  let response = {
    statusCode: 200,
    body: {},
    // Tell slack we don't want retries, to avoid multiple triggers of this lambda
    headers: { 'X-Slack-No-Retry': 1 }
  };

  console.log(dataObject);
  try {
    if (!('X-Slack-Retry-Num' in data.headers)) {
      switch (dataObject.type) {
        case 'url_verification':
          response.body = verifyCall(dataObject);
          break;
        case 'event_callback':
          await handleEvent(dataObject.event);
          response.body = { ok: true };
          break;
        case 'block_actions':
          await handleActions(dataObject, botToken);
          response.body = { ok: true };
        case 'message':
          await handleMessage(dataObject.event);
          response.body = { ok: true };
        default:
          response.statusCode = 400,
            response.body = 'Empty request';
          break;
      }
    }
  }
  catch (err) {
    response.statusCode = 500,
      response.body = JSON.stringify(err)
  }
  finally {
    return response;
  }
}


function verifyCall(data) {
  if (data.token === verificationToken) {
    return data.challenge;
  }
  else {
    throw 'Verification failed';
  }
}

async function handleMessage(slackEvent) {
  if (slackEvent.channel_type && slackEvent.channel_type === "im" && !slackEvent.bot_id) {
    await handleEvents(slackEvent, botToken);
  }
}

async function handleEvent(slackEvent) {
  if (!slackEvent.bot_id) {
    await handleEvents(slackEvent, botToken);
  }
}