'use strict';

const { handleEvents, handleIncomingActions, handleViews } = require('./eventHandling');
const querystring = require('querystring');
const crypto = require('crypto');

const secret = process.env.SLACK_SIGNING_SECRET || '1111111111111111111111111';
const botToken = process.env.SLACK_BOT_TOKEN || 'xoxb-werwer-werwer-werw-erwer-werwre';
const verificationToken = process.env.VERIFICATION_TOKEN;

module.exports.lambdaHandler = async (data, context) => {
  if (process.env.DEBUG_LOGS) {
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


  //Extra paranoia points
  try {
    if (!verifySignature(data)) {
      response.statusCode = 401;
      return response;
    }
  } catch (error) {
    response.statusCode = 401;
    return response;
  }


  console.log(dataObject);
  try {
    if (!('X-Slack-Retry-Num' in data.headers)) {
      console.log(dataObject.type);
      const {
        initializeConnection
      } = require("./databaseInterface");

      initializeConnection(context.getRemainingTimeInMillis());

      switch (dataObject.type) {
        case 'url_verification':
          response.body = verifyCall(dataObject);
          break;
        case 'event_callback':
          await handleEvent(dataObject.event, context);
          response.body = { ok: true };
          break;
        case 'block_actions':
          await handleIncomingActions(dataObject, botToken, context);
          response.body = { ok: true };
          break;
        case 'view_submission':
          const responseResult = await handleViews(dataObject, botToken);
          response.body = { ok: true };
          console.log(responseResult);
          console.log('view handled');
          break;
        case 'message':
          await handleMessage(dataObject.event, context);
          response.body = { ok: true };
          break;
        default:
          response.statusCode = 400;
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


function verifySignature(data) {
  const slackTimestamp = data.headers['X-Slack-Request-Timestamp'];
  const slackSignature = data.headers['X-Slack-Signature'];

  const timestamp = Math.floor(Date.now() / 1000);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update('v0:' + slackTimestamp + ':' + data.body);
  const signature = 'v0=' + hmac.digest('hex');

  if (!slackTimestamp
    || !slackSignature
    || Math.abs(timestamp - slackTimestamp) > 60 * 5
    || signature !== slackSignature) {
    return false;
  }

  return true;
}


function verifyCall(data) {
  if (data.token === verificationToken) {
    return data.challenge;
  }
  else {
    throw 'Verification failed';
  }
}

async function handleMessage(slackEvent, context) {
  if (slackEvent.channel_type && slackEvent.channel_type === "im" && !slackEvent.bot_id) {
    await handleEvents(slackEvent, botToken, context);
  }
}

async function handleEvent(slackEvent, context) {
  if (!slackEvent.bot_id) {
    await handleEvents(slackEvent, botToken, context);
  }
}


