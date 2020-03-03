const {
  giveCategoryModal,
  votedSuccesfullyMessage
} = require("./blockTools");
const {
    categoryActionId
  } = require("./modalDefinitions");
const {
  voteByCategoryId} = require("./databaseInterface");

const Slack = require('slack');
const scorePattern = /[0-9]+$/;



exports.handleVotingSaga = (slackEvent, botToken, action)  => {
    // ack();

    try {
      const { botToken } = context;
      const { channel, message } = slackEvent;

      const { actions, trigger_id } = slackEvent;
      const { selected_option } = action;
      const selectedCategory = {
        id: selected_option.value,
        name: selected_option.text.text
      };

      const modal = {
        ...giveCategoryModal(selectedCategory),
        private_metadata: {
          category: selectedCategory,
          channel_id: channel.id,
          message_ts: message.ts
        }
      };

      const params = {
        token: botToken,
        trigger_id,
        view: JSON.stringify(modal)
      }
      console.log(params);
      return Slack.views.open(params)

    } catch (error) {
      console.error(error);
    }
}

exports.handleModalInput = ({ ack, view, context }) => {
    try {
      const { botToken, user } = context;
      const {
        state: {
          values: {
            vote_block: { vote_input }
          }
        },
        private_metadata
      } = view;

      const { category, channel_id, message_ts } = JSON.parse(private_metadata);
      const vote = vote_input.value;

      // Acknowledge the view_submission event with or without errors.
      if (!scorePattern.test(vote)) {
        ack({
          errors: [
            {
              name: "vote_input",
              error: "Sorry, this isn’t a valid score"
            }
          ]
        });
        return;
      }

      ack();

      // TODO update database.
      const categoryId = parseInt(category.id);
      const voteNumber = parseInt(vote);

      // UPDATE_DATABASE_HERE
       voteByCategoryId(categoryId, user, voteNumber);
      
      // Update the message
      const scoreUpdatedBlocks = votedSuccesfullyMessage(
        voteNumber,
        category.name
      ).blocks;
    } catch (error) {
      console.error(error);
    }
};
