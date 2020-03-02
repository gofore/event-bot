const {
    createSelection,
    createAsker
} = require("./blockTools");
const {
    requestAllCategories,
    requestAllTeams,
    requestEventName
} = require("./databaseInterface");

exports.teamActionId = "team_select";
exports.categoryActionId = "category_select";

exports.giveCategoryNameMsg = categories => {
    return createSelection(categories, "Pick category to vote in from the list", exports.categoryActionId, "Select category");
};

exports.giveTeamNameMsg = teams => {
  return createSelection(teams, "Pick your team from the dropdown list", exports.teamActionId,"Select your team")
};

exports.createAskForTeam = app => async (botToken, channel) => {
    return createAsker(app, requestAllTeams, requestEventName,
      c => ({id: c.team_id, name: c.team_name}), exports.giveTeamNameMsg, "Select your team");
}; 

exports.createAskForVote = app => async (botToken, channel) => {
    return createAsker(app, requestAllCategories, requestEventName,
        c => ({id: c.category_id, name: c.category_name}), exports.giveCategoryNameMsg, "Select voting category");
  }; 