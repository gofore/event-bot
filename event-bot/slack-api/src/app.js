'use strict';

const AWS   = require('aws-sdk');
const Slack = require('slack');

const secret = process.env.SLACK_SIGNING_SECRET || '1111111111111111111111111';
const botToken = process.env.SLACK_BOT_TOKEN || 'xoxb-werwer-werwer-werw-erwer-werwre';
const verificationToken = process.env.VERIFICATION_TOKEN;

module.exports.lambdaHandler = async ( data ) => 
{
    const dataObject = JSON.parse( data.body );

    // The response we will return to Slack
    let response = {
        statusCode: 200,
        body      : {},
        // Tell slack we don't want retries, to avoid multiple triggers of this lambda
        headers   : { 'X-Slack-No-Retry': 1 }
    };

    try {
        if ( !( 'X-Slack-Retry-Num' in data.headers ) )
        {
            switch ( dataObject.type ) 
            {
                case 'event_callback':
                    await handleMessage( dataObject.event );
                    response.body = { ok: true }; 
                    break;
                default:
                    response.statusCode = 400,
                    response.body = 'Empty request';
                    break;
            }
        }
    }
    catch( err ) 
    {
        response.statusCode = 500,
        response.body = JSON.stringify( err )
    } 
    finally 
    {
        return response;
    }   
}

/**
 * Verifies the URL with a challenge - https://api.slack.com/events/url_verification
 * @param  {Object} data The event data
 */
function verifyCall( data )
{
    if ( data.token === verificationToken ) 
    {
        return data.challenge;
    }
    else {
        throw 'Verification failed';
    }
}

async function handleMessage( slackEvent )
{
    // Makes sure the bot was actually mentioned
    if ( !slackEvent.bot_id )
    {
        // Gets the command from the message
        let command = parseMessage( slackEvent.text );

        // Executes differend commands based in the specified instruction
        switch ( command ) 
        {
            // case 'invalidate_cdn':
            //     const invalidationData = await invalidateDistribution();
            //     await sendSlackMessage( slackEvent.channel, 
            //         `Sir/Madam, I've just invalidated the cache, this is the invalidation ID. *${invalidationData.Invalidation.Id}*` );
            //     break;
            default:
                await sendSlackMessage( slackEvent.channel, 
                    `Hello sir, Maybe this one will work finally.` );
                break;
        }
    }
}


function sendSlackMessage( channel, message )
{
    const params = {
        token  : botToken,
        channel: channel,
        text   : message
    };

    return Slack.chat.postMessage(params);
}

function parseMessage(message)
{
    return message.split( ' ', 2 ).pop();
}
