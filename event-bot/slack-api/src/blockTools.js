const Slack = require('slack');
const {postSlack, postOk} = require('./helpers');

exports.createAsker = (requestFunction, requestData, mapLambda, blockBuilder) => async (botToken, message) => {
  const objects = await requestFunction(requestData());
  if (objects.length === 0) {
    const errMessage = {
      token: botToken,
      channel: message.channel,
      text: 'No teams registered yet! Register team first.',
      user: message.user,
      attachments: []
    }

    return Slack.chat.postEphemeral(errMessage);
  }
  const items = objects.map(mapLambda);
  const blocks = blockBuilder(items).blocks;
  const params = {
    token: botToken,
    channel: message.channel,
    blocks: blocks,
    text: 'blocks should be here',
    user: message.user,
    attachments: []
  };

  return Slack.chat.postEphemeral(params);
};


exports.createSelection = (selections, helpText, actionId, selectionPlaceHolder) => {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: helpText
        },
        accessory: {
          type: "static_select",
          action_id: actionId,
          placeholder: {
            type: "plain_text",
            text: selectionPlaceHolder,
            emoji: true
          },
          options: selections.map(t => ({
            text: {
              type: "plain_text",
              text: t.name,
              emoji: true
            },
            value: `${t.id}`
          }))
        }
      }
    ]
  };
}


exports.giveGameMsg = games => {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Now pick your current game"
        },
        accessory: {
          type: "static_select",
          action_id: "game_select",
          placeholder: {
            type: "plain_text",
            text: "Select an item",
            emoji: true
          },
          options: games.map(t => ({
            text: {
              type: "plain_text",
              text: t.name,
              emoji: true
            },
            value: `{t.id}`
          }))
        }
      }
    ]
  };
};


exports.giveCategoryModal = (category) => {
  return {
    type: "modal",
    callback_id: "setVoteModal",
    title: {
      type: "plain_text",
      text: category.name,
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true
    },
    blocks: [
      {
        type: "input",
        block_id: "vote_block",
        element: {
          type: "plain_text_input",
          action_id: "vote_input",
          placeholder: {
            type: "plain_text",
            text: "Vote by image number [0-9]+"
          }
        },
        label: {
          type: "plain_text",
          text: "Vote",
          emoji: true
        },
        optional: false
      }
    ]
  };
}


exports.finishModal = async function (parameterBoundBlockGenerator, view, botToken) {
  const scoreUpdatedBlocks = parameterBoundBlockGenerator.blocks;
  view.blocks = {
    scoreUpdatedBlocks
  };
  const successParams = {
    token: botToken,
    view: JSON.stringify(view),
    view_id: view.id
  };
  console.log('acking');
  const slackResponse = await postSlack('views.update', botToken, successParams);
  if (process.env.DEBUG_LOGS) {
    console.log(slackResponse);
  }
}



exports.votedSuccesfullyMessage = (voteNumber, category) => ({
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `You voted for ${voteNumber} in category ${category}.`
      }
    }
  ]
});


exports.giveGameAndScoreModal = (team, games) => {
  return {
    type: "modal",
    callback_id: "setScoreModal",
    title: {
      type: "plain_text",
      text: team.name,
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true
    },
    blocks: [
      {
        type: "input",
        block_id: "game_block",
        element: {
          type: "static_select",
          action_id: "game_select",
          placeholder: {
            type: "plain_text",
            text: "Select your current game",
            emoji: true
          },
          options: games.map(t => ({
            text: {
              type: "plain_text",
              text: t.name,
              emoji: true
            },
            value: `${t.id}`
          }))
        },
        label: {
          type: "plain_text",
          text: "Game",
          emoji: true
        },
        optional: false
      },
      {
        type: "input",
        block_id: "score_block",
        element: {
          type: "plain_text_input",
          action_id: "score_input",
          placeholder: {
            type: "plain_text",
            text: "Set your score [0-9]+"
          }
        },
        label: {
          type: "plain_text",
          text: "Score",
          emoji: true
        },
        optional: false
      }
    ]
  };
};

exports.scoreUpdatedMsg = (teamName, gameName, score) => ({
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${teamName}: Game ${gameName} score set to ${score}.`
      }
    }
  ]
});
