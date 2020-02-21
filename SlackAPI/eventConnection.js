const {DatabaseConnection} = require('../ScorebotMysqlDB/mysqlDatabaseConnection');

const eventName = "hw";

const connection = new DatabaseConnection();

//TODO: a way to make the functions more like each other without doing await in each function since the caller can do that as well.
exports.timeUntilEventEnd = (eventName, optionalLocation) => {
    return connection.timeUntilEventEnd(eventName, optionalLocation);
};


exports.timeUntilEvent = (eventName) => {
    return connection.timeUntilEvent(eventName);
};


exports.saveScore = async (eventName, gameName, teamName, score) => {
    const exists = await exports.doesTeamExist(eventName, teamName); 
    if(!exists){
        await exports.registerTeam(eventName, teamName);
    }

    return connection.saveScore(eventN, gameName, teamName, score);
};


exports.voteImage = (eventName, imageNumber) => {
    return connection.voteFor(eventName, 123123, imageNumber);
}


exports.requestSoonestEvent = (date) => {
    return connection.findSoonestEvent();
};


exports.locationOfEvent = (eventName) => {
    return connection.requestEventLocation(eventName);
};



exports.requestTopScore = async function(eventName, gameName, scoreFor){
    const scores = await connection.requestTopScoreFor(eventName, gameName);
    return scores.slice(0, scoreFor - 1);
}

exports.doesTeamExist = async (eventName, teamName) => {
    return await connection.findTeamsWithName(eventName, teamName).length > 0;
};


exports.registerTeam = (eventName, teamName) => {
    return connection.registerTeam(eventName, teamName);
};


exports.requestAllGames = function(eventName){
    return connection.requestAllGames(eventName);
};


exports.requestEventName = function(){
    //TODO: this is not fully developed to work proper
    return eventName;
};
