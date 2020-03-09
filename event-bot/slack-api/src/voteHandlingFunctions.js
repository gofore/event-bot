const {
  giveCategoryModal,
  votedSuccesfullyMessage,
  finishModal
} = require("./blockTools");
const {
  categoryActionId
} = require("./modalDefinitions");
const {
  voteByCategoryId } = require("./databaseInterface");
const { postSlack, postOk } = require('./helpers');

const Slack = require('slack');
const scorePattern = /[0-9]+$/;



exports.handleVotingSaga = async (slackEvent, botToken, action) => {
  try {
    const { channel } = slackEvent;

    const { trigger_id } = slackEvent;
    const { selected_option } = action;
    const selectedCategory = {
      id: selected_option.value,
      name: selected_option.text.text
    };

    const modal = {
      ...giveCategoryModal(selectedCategory),
      private_metadata: JSON.stringify({
        category: selectedCategory,
        channel_id: channel.id
      })
    };

    const params = {
      token: botToken,
      trigger_id,
      view: JSON.stringify(modal)
    };

    const result = await postSlack('views.open', botToken, params);
    if(process.env.DEBUG_LOGS){
      const objectified = await result.json();
      console.log(objectified);
    }

  } catch (error) {
    console.error(error);
  }
}

exports.voteModalSubmitted = async (slackEvent, botToken) => {
  try {
    const { view } = slackEvent;
    const { user } = slackEvent;
    const {
      state: {
        values: {
          vote_block: { vote_input }
        }
      },
      private_metadata
    } = view;

    const { category, channel_id } = JSON.parse(private_metadata);
    const vote = vote_input.value;

    // Acknowledge the view_submission event with or without errors.
    if (!scorePattern.test(vote)) {
      //TODO error msg
      return;
    }
    const categoryId = parseInt(category.id);
    const voteNumber = parseInt(vote);
    const userId = user.id;
    // UPDATE_DATABASE_HERE
    await voteByCategoryId(categoryId, userId, voteNumber);

    await finishModal(votedSuccesfullyMessage.bind(this, voteNumber, category.name), view, botToken);
  } catch (error) {
    console.error(error);
  }
};