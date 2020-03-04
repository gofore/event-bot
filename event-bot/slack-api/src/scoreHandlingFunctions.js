const {
  giveGameAndScoreModal,
  scoreUpdatedMsg
} = require("./blockTools");
const {
  teamActionId
} = require("./modalDefinitions");
const {
  requestAllTopScores,
  requestAllGames,
  saveScore,
  requestEventName,
  requestTopScore
} = require("./databaseInterface");
const fetch = require('node-fetch');
const Slack = require('slack');

const scorePattern = /[0-9]+$/;


exports.handleScoringSaga = (slackEvent, botToken, action) => {
  try {
    const { channel } = slackEvent;

    // Extract selected team.
    const { trigger_id } = slackEvent;
    const { selected_option } = action;
    const selectedTeam = {
      id: selected_option.value,
      name: selected_option.text.text
    };

    const games = requestAllGames(requestEventName()).map(c => ({
      id: c.game_id,
      name: c.game_name
    }));
    // const selectGameBlocks = giveGameMsg(games).blocks;
    const modal = {
      ...giveGameAndScoreModal(selectedTeam, games),
      private_metadata: JSON.stringify({
        team: selectedTeam,
        channel_id: channel.id
      })
    };
    const params = {
      token: botToken,
      trigger_id,
      view: modal
    };

    return fetch('https://slack.com/api/views.open', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + botToken
      },
      body: JSON.stringify(params)
    });
  } catch (error) {
    console.error(error);
  }
}


exports.scoreModal = ({ ack, view, botToken }) => {
  try {
    const {
      state: {
        values: {
          game_block: { game_select },
          score_block: { score_input }
        }
      },
      private_metadata
    } = view;

    const { team, channel_id } = JSON.parse(private_metadata);
    const game = {
      id: game_select.selected_option.value,
      name: game_select.selected_option.text.text
    };
    const score = score_input.value;

    // Acknowledge the view_submission event with or without errors.
    if (!scorePattern.test(score)) {
      ack({
        errors: [
          {
            name: "score_input",
            error: "Sorry, this isn’t a valid score"
          }
        ]
      });
      return;
    }

    ack();

    const scoreNumber = parseInt(score);

    // UPDATE_DATABASE_HERE
    saveScore(requestEventName(), team.name, game.name, scoreNumber);

    // Update the message
    const scoreUpdatedBlocks = scoreUpdatedMsg(
      team.name,
      game.name,
      scoreNumber
    ).blocks;
  } catch (error) {
    console.error(error);
  }
};

const stringifyScores = scorePackage => {
  let scores = "";

  scorePackage.forEach(element => {
    let game = '';
    if (element.game_name) {
      game = ' in ' + element.game_name;
    }
    scores += "    " + element.team_name + " with score " + element.score + game + "\n";
  });
  return scores;
}

exports.showSingleGamesScores = async (say, gameRequested, topsRequested) => {
  const scorePackage = await requestTopScore(
    requestEventName(),
    gameRequested,
    topsRequested
  );

  if (Boolean(scorePackage)) {
    const scores = stringifyScores(scorePackage);
    await say(`Tops are for ${gameRequested}:\n${scores}`);
  } else {
    await say("Top list was not able to be retreived with the parameters given");
  }
};

exports.showAllGameScores = async (say) => {
  const scorePackage = await requestAllTopScores(requestEventName());
  const scores = stringifyScores(scorePackage);
  await say(`Scores are:\n${scores}`);
};