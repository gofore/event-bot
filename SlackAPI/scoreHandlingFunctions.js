const { directMention } = require("@slack/bolt");
const {
  giveTeamNameMsg,
  giveGameMsg,
  giveGameAndScoreModal,
  scoreUpdatedMsg
} = require("./setScoreMessages");
const { directMessage } = require("./helpers");
const { 
  requestAllGames, 
  requestAllTeams, 
  saveScore } = require("./eventConnection");

const eventId = "housewarming";
const scorePattern = /[0-9]+$/;

exports.createAskForTeam = app => async (botToken, channel) => {
    try {
      const teams = await requestAllTeams(eventId).map(c => ({
        id: c.team_id,
        name: c.team_name
      }));
      const selectTeamBlocks = giveTeamNameMsg(teams).blocks;

      const result = await app.client.chat.postMessage({
        token: botToken,
        channel: channel,
        blocks: selectTeamBlocks,
        // Text in the notification
        text: "Select your team"
      });
    } catch (error) {
      console.error(error);
    }
  }; 


exports.registerSaga = app => {
  this.askForTeam = 


  // Listen for the team selection.
  app.action("team_select", async ({ ack, body, context }) => {
    // Acknowledge the select request
    ack();

    try {
      const { botToken } = context;
      const { channel, message } = body;

      // Extract selected team.
      const { actions, trigger_id } = body;
      const { selected_option } = actions[0];
      const selectedTeam = {
        id: selected_option.value,
        name: selected_option.text.text
      };

      const games = await requestAllGames(eventId).map(c => ({
        id: c.game_id,
        name: c.game_name
      }));
      // const selectGameBlocks = giveGameMsg(games).blocks;
      const modal = {
        ...giveGameAndScoreModal(selectedTeam, games),
        private_metadata: JSON.stringify({
          team: selectedTeam,
          channel_id: channel.id,
          message_ts: message.ts
        })
      };

      // Update the message
      //  const result = await app.client.chat.update({
      //         token: botToken,
      //         // ts of message to update
      //         ts: message.ts,
      //         // Channel of message
      //         channel: channel.id,
      //         blocks: selectGameBlocks,
      //         text: "Pick your ongoing game",
      //         view_payload: selectedTeam,
      //       });

      const result = app.client.views.open({
        token: botToken,
        trigger_id: trigger_id,
        // View payload
        view: modal
      });
    } catch (error) {
      console.error(error);
    }
  });

  // Listen for the game and score result.
  app.view("setScoreModal", async ({ ack, body, view, context }) => {
    try {
      const { botToken } = context;
      const {
        state: {
          values: {
            game_block: { game_select },
            score_block: { score_input }
          }
        },
        private_metadata
      } = view;

      const { team, channel_id, message_ts } = JSON.parse(private_metadata);
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

      // TODO update database.
      const teamId = parseInt(team.id);
      const gameId = parseInt(game.id);
      const scoreNumber = parseInt(score);

      // UPDATE_DATABASE_HERE
      await saveScore(eventId, team.name, game.name, scoreNumber);
      
      // Update the message
      const scoreUpdatedBlocks = scoreUpdatedMsg(
        team.name,
        game.name,
        scoreNumber
      ).blocks;
      const result = await app.client.chat.update({
        token: botToken,
        // ts of message to update
        ts: message_ts,
        // Channel of message
        channel: channel_id,
        blocks: scoreUpdatedBlocks,
        text: `Game ${game.name} score updated`
      });
    } catch (error) {
      console.error(error);
    }
  });
};
