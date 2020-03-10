const {
  giveGameAndScoreModal,
  scoreUpdatedMsg,
  finishModal
} = require("./blockTools");
const {
  teamActionId
} = require("./modalDefinitions");
const {
  requestAllTopScores,
  requestAllGames,
  saveScore,
  saveScoreById,
  requestEventName,
  requestTopScore
} = require("./databaseInterface");
const fetch = require('node-fetch');
const Slack = require('slack');
const {postSlack, postOk} = require('./helpers');
const {logError} = require('./logging');

const scorePattern = /[0-9]+$/;


exports.handleScoringSaga = async (slackEvent, botToken, action) => {
  try {
    const { channel } = slackEvent;

    // Extract selected team.
    const { trigger_id } = slackEvent;
    const { userId } = slackEvent.user;
    const { selected_option } = action;
    const selectedTeam = {
      id: selected_option.value,
      name: selected_option.text.text
    };

    const gamesFromDB = await requestAllGames(requestEventName());
    if(gamesFromDB.length === 0){
      const errMessage = {
        token: botToken,
        channel: channel.id,
        text: 'No games found in the event. Contact event organizer about this!',
        user: userId,
        attachments: []
      }
  
      return Slack.chat.postEphemeral(errMessage);
    }

    const games = gamesFromDB.map(c => ({
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
      view: JSON.stringify(modal)
    };

    return postSlack('views.open', botToken, params);

  } catch (error) {
    logError(error);
  }
}


exports.scoreModalSubmitted = async (slackEvent, botToken) => {
  try {
    const { view } = slackEvent;
    const {
      state: {
        values: {
          game_block: { game_select },
          score_block: { score_input }
        }
      },
      private_metadata
    } = view;

    const { trigger_id } = slackEvent;
    const { team, channel_id } = JSON.parse(private_metadata);
    const game = {
      id: game_select.selected_option.value,
      name: game_select.selected_option.text.text
    };
    const score = score_input.value;

    // Acknowledge the view_submission event with or without errors.
    if (!scorePattern.test(score)) {
      view.blocks = {
        ...
        {
          type: 'section',
          text: 'Sorry, this isn’t a valid score'
        }
      };
      const params = {
        token: botToken,
        trigger_id,
        view: JSON.stringify(view)
      };

      return postSlack('views.update', botToken, params);
    }
    
    const teamId = parseInt(team.id);
    const gameId = parseInt(game.id);
    const scoreNumber = parseInt(score);

    // UPDATE_DATABASE_HERE
    await saveScoreById(requestEventName(), gameId, teamId, scoreNumber);

    // Update the message
    await finishModal(scoreUpdatedMsg.bind(this, team.name, game.name, scoreNumber), view, botToken);
  } catch (error) {
    logError(error);
  }
};

const stringifyScores = scorePackage => {
  let scores = '';

  scorePackage.forEach(element => {
    let game = '';
    if (element.game_name) {
      game = ' in ' + element.game_name;
    }
    scores += '    ' + element.team_name + ' with score ' + element.score + game + '\n';
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


