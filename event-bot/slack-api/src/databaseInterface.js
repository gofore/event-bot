const {DatabaseConnection} = require('./mysqlDatabaseConnection');

const eventName = "hw";

const connection = new DatabaseConnection();

//TODO: a way to make the functions more like each other without doing await in each function since the caller can do that as well.
exports.timeUntilEventEnd = (eventName, optionalLocation) => {
    return connection.queryTimeUntilEventEnd(eventName, optionalLocation);
};


exports.timeUntilEvent = (eventName) => {
    return connection.queryDateFor(eventName);
};


exports.saveScoreById = async (eventName, gameId, teamId, score) => {
    return connection.saveScoreById(eventName, gameId, teamId, score);
}


exports.saveScore = async (eventName, gameName, teamName, score) => {
    const exists = await exports.doesTeamExist(eventName, teamName); 
    if(!exists){
        await exports.registerTeam(eventName, teamName);
    }

    return connection.saveScore(eventN, gameName, teamName, score);
};


exports.voteImage = (eventName, categoryName, slackId, imageNumber) => {
    return connection.voteFor(eventName, categoryName, slackId, imageNumber);
}

exports.requestAllCategories = (eventName) => {
    return connection.requestAllCategories(eventName);
}

exports.voteByCategoryId = (categoryId, slackId, imageNumber) => {
    return connection.voteById(categoryId, slackId, imageNumber);
}


exports.requestSoonestEvent = (date) => {
    return connection.findSoonestEvent();
};


exports.locationOfEvent = (eventName) => {
    return connection.requestEventLocation(eventName);
};


exports.requestAllTopScores = async (eventName, scoreFor) => {
    const results = await connection.requestAllTopScores(eventName);
    if(scoreFor){
        return results.slice(0, scoreFor - 1);
    }
    return results;
}


exports.requestTopScore = async (eventName, gameName, scoreFor) => {
    const scores = await connection.requestTopScoreFor(eventName, gameName);
    return scores.slice(0, scoreFor - 1);
}

exports.doesTeamExist = async (eventName, teamName) => {
    return await connection.findTeamsWithName(eventName, teamName).length > 0;
};


exports.registerTeam = (eventName, teamName) => {
    return connection.registerTeam(eventName, teamName);
};


exports.requestAllGames = (eventName) => {
    return connection.requestAllGames(eventName);
};


exports.requestEventName = ()=>{
    //TODO: this is not fully developed to work proper
    return eventName;
};


exports.requestAllTeams = (eventName) => {
    return connection.requestAllTeams(eventName);
}