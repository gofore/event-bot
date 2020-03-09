const fetch = require('node-fetch');
const {
  getEventRegistrations
} = require("./eventRegistrations");
const { handleVotingSaga, voteModalSubmitted } = require("./voteHandlingFunctions");
const { handleScoringSaga, scoreModalSubmitted } = require("./scoreHandlingFunctions");
const Slack = require('slack');
const {
  teamActionId
} = require("./modalDefinitions");
const {
  categoryActionId
} = require("./modalDefinitions");


const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

//This shouldnt be necessary
const handleAllActionsFromEvent = async (slackEvent, botToken) => {
  if(process.env.DEBUG_LOGS){
    console.log(`Handling Action ${slackEvent.toString()}`);
  }
  
  const reactToActions = async (slackEvent, botToken) => {
    await asyncForEach(slackEvent.actions, async (action) => {
      switch (action.action_id) {
        case teamActionId:
          await handleScoringSaga(slackEvent, botToken, action);
          break;
        case categoryActionId:
          await handleVotingSaga(slackEvent, botToken, action);
          break;
      }
    });
  };

  try {
    await reactToActions(slackEvent, botToken);
  } catch (error) {
    console.error(error);
  }
}

exports.handleIncomingActions = async (slackEvent, botToken, context) => {
  await handleAllActionsFromEvent(slackEvent, botToken);
}


exports.handleViews = async (slackEvent, botToken) => {
  const { callback_id } = slackEvent.view;
  switch (callback_id) {
    case 'setScoreModal':
      await scoreModalSubmitted(slackEvent, botToken);
      break;
    case 'setVoteModal':
      await voteModalSubmitted(slackEvent, botToken);
      break;
    default:
      break;
  }
  
}


const handleRegistreables = async (registereableMessageEvents, slackEvent, botToken, context) => {
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
          //TODO: acking?
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
