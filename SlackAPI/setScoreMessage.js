exports.giveTeamNameMsg = teams => {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Pick your team from the dropdown list"
        },
        accessory: {
          type: "static_select",
          action_id: "team_select",
          placeholder: {
            type: "plain_text",
            text: "Select your team",
            emoji: true
          },
          options: teams.map(t => ({
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
};

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
