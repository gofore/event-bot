const fetch = require('node-fetch');
const {
  getEventRegistrations
} = require("./eventRegistrations");
const { handleVotingSaga } = require("./voteHandlingFunctions");
const { handleScoringSaga } = require("./scoreHandlingFunctions");
const Slack = require('slack');
const {
  teamActionId
} = require("./modalDefinitions");
const {
  categoryActionId
} = require("./modalDefinitions");
const {
initializeConnection
} = require("./databaseInterface");


const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

exports.handleActions = async (slackEvent, botToken) => {
  if(process.env.DEBUG_LOGS){
    console.log(`Handling Action ${slackEvent}`);
  }
  
  const handleAction = async () => {
    await asyncForEach(slackEvent.actions, async (action) => {
      switch (action.action_id) {
        case teamActionId:
          const result = await handleScoringSaga(slackEvent, botToken, action);
          console.log(result);
          break;
        case categoryActionId:
          await handleVotingSaga(slackEvent, botToken, action);
          console.log(categoryActionId);
          break;
      }
    });
  };
  handleAction();
}


const handleRegistreables = async (registereableMessageEvents, slackEvent, botToken, context) => {
  initializeConnection(context.getRemainingTimeInMillis());

  const sayFunc = (message) => {
    const params = {
      token: botToken,
      channel: slackEvent.channel,
      text: message
    };
    return Slack.chat.postMessage(params);
  };

  const sayEphemeral = (message) => {
    const params = {
      token: botToken,
      channel: slackEvent.channel,
      text: message,
      user: slackEvent.user,
      attachments: []
    }

    return Slack.chat.postEphemeral(params);
  }

  const checkForMatchAndRun = async () => {
    await asyncForEach(registereableMessageEvents, async command => {
      if (slackEvent.text.match(command.query)) {
        if (command.heavy) {
          // const response = await fetch('https://slack.com/api/chat.postMessage', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //     'Authorization': 'Bearer ' + botToken,
          //     'X-Slack-No-Retry': 1
          //   },
          //   statusCode: 200,
          //   body: {}
          // });
          // console.log('heavy task');
          // console.log(response);

          await sayEphemeral(`Processing request "${slackEvent.text}".`);
        }
        await command.lambda({ message: slackEvent, say: sayFunc, botToken, events: registereableMessageEvents, sayEphemeral });
      }
    });
  };
  try {
    await checkForMatchAndRun();
  } catch (error) {
    console.error(error);
  }

};


exports.handleEvents = async (slackEvent, botToken, context) => {
  const registereableMessageEvents = getEventRegistrations();

  await handleRegistreables(registereableMessageEvents, slackEvent, botToken, context);
};
