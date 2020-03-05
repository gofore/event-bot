const {DatabaseConnection} = require('./mysqlDatabaseConnection');

const constEventName = "hw";

let connection;

exports.initializeConnection = async(timeleft) => {
    connection = new DatabaseConnection(timeleft);
}

exports.timeUntilEventEnd = async (eventName, optionalLocation) => {
    return connection.queryTimeUntilEventEnd(eventName, optionalLocation)[0].end_time;
};


exports.timeUntilEvent = async (eventName) => {
    try {
        await connection.startConnection();
        const result = await connection.queryDateFor(eventName);
        connection.endConnection();
        return result[0].starting_date;
    } catch (error) {
        console.error(error);
    }

    return null;
};


exports.saveScoreById = async (eventName, gameId, teamId, score) => {
    return connection.saveScoreById(eventName, gameId, teamId, score);
}


exports.saveScore = async (eventName, gameName, teamName, score) => {
    const exists = await exports.doesTeamExist(eventName, teamName); 
    if(!exists){
        await exports.registerTeam(eventName, teamName);
    }

    return connection.saveScore(eventName, gameName, teamName, score);
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


exports.locationOfEvent = async (eventName) => {
    const result = await connection.requestEventLocation(eventName);

    if(result.length > 0){
        return result[0].location;
    }
    else{
        return null;
    }
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
    return constEventName;
};


exports.requestAllTeams = (eventName) => {
    return connection.requestAllTeams(eventName);
}

exports.requestAllVotes = (eventName) => {
    return connection.requestAllVotes(eventName);
}