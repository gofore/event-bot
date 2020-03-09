'use strict';

const { handleEvents, handleIncomingActions, handleViews } = require('./eventHandling');
const querystring = require('querystring');
const crypto = require('crypto');

const secret = process.env.SLACK_SIGNING_SECRET || '1111111111111111111111111';
const verificationToken = process.env.VERIFICATION_TOKEN;

module.exports.lambdaHandler = async (data, context) => {
  if (process.env.DEBUG_LOGS) {
    console.log(data);
  }


  let response = {
    statusCode: 200,
    body: {},
    // Tell slack we don't want retries, to avoid multiple triggers of this lambda
    headers: { 'X-Slack-No-Retry': 1 }
  };


  const { httpMethod } = data;

  switch (httpMethod) {
    case 'POST':
      //Slack communication
      return await handleSlackEvents(data, context, response);
    case 'GET':
      //Authenticating OAuth user
      const parameters = data.queryStringParameters;

      const code = parameters.code;

      console.log(code);
      const { postFormURLEncoded } = require('./helpers');
      const oauthParams = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code
      };

      const accessTokenResponse = await postFormURLEncoded('oauth.v2.access', oauthParams);
      console.log(accessTokenResponse);
      const objectified = JSON.parse(accessTokenResponse);
      console.log(objectified);
      if(!objectified.ok){
        response.statusCode = 500;
        return response;
      }
      const accessToken = objectified.access_token;
      const teamId = objectified.team.id;

      const { registerAccessToken } = require('./databaseInterface')
      initializeDBConnection(context);
      await registerAccessToken(teamId, accessToken);

      response.body = { ok: true };
      return response;
    default:
      break;
  }


}


async function handleSlackEvents(data, context, botToken, response) {
  //Extra paranoia points for try catch
  try {
    if (!verifySignature(data)) {
      response.statusCode = 401;
      return response;
    }
  } catch (error) {
    response.statusCode = 401;
    return response;
  }

  let dataObject;
  if (data.body.includes('payload=')) {
    dataObject = JSON.parse(querystring.parse(data.body).payload);
  }
  else {
    dataObject = JSON.parse(data.body);
  }
  if (process.env.DEBUG_LOGS) {
    console.log(dataObject);
  }

  try {
    if (!('X-Slack-Retry-Num' in data.headers)) {
      initializeDBConnection(context);
      const botToken = await getBotToken(dataObject);

      switch (dataObject.type) {
        case 'url_verification':
          response.body = verifyCall(dataObject);
          break;
        case 'event_callback':
          await handleEvent(dataObject.event, botToken, context);
          response.body = { ok: true };
          break;
        case 'block_actions':
          await handleIncomingActions(dataObject, botToken, context);
          response.body = { ok: true };
          break;
        case 'view_submission':
          await handleViews(dataObject, botToken);
          response.body = { ok: true };
          break;
        case 'message':
          await handleMessage(dataObject.event, botToken, context);
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


function initializeDBConnection(context) {
  const { initializeConnection } = require('./databaseInterface')
  initializeConnection(context.getRemainingTimeInMillis());
}


async function getBotToken(dataObject){
  const {
    getAccessToken
  } = require("./databaseInterface");
  let teamId;
  if(dataObject.team_id){
    teamId = dataObject.team_id;
  } else if (dataObject.team.id){
    teamId = dataObject.team.id;
  } else {
    throw new Error('Team id was not found on dataobject with current methods!');
  }

  const accessTokenFetchResult = await getAccessToken(teamId);
  let accessToken;
  if(accessTokenFetchResult){
    accessToken = accessTokenFetchResult.access_token;
  }

  const botToken = accessToken || process.env.SLACK_BOT_TOKEN || 'xoxb-not-totally-real-123123-123';
  return botToken;
}


function verifyCall(data) {
  if (data.token === verificationToken) {
    return data.challenge;
  }
  else {
    throw 'Verification failed';
  }
}

async function handleMessage(slackEvent, botToken, context) {
  if (slackEvent.channel_type && slackEvent.channel_type === "im" && !slackEvent.bot_id) {
    await handleEvents(slackEvent, botToken, context);
  }
}

async function handleEvent(slackEvent, botToken, context) {
  if (!slackEvent.bot_id) {
    await handleEvents(slackEvent, botToken, context);
  }
}


