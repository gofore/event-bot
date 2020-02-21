const {DatabaseConnection} = require('../ScorebotMysqlDB/mysqlDatabaseConnection');

const eventName = "hw";

const connection = new DatabaseConnection();

exports.timeUntilEventEnd = (eventName, optionalLocation) => {
    return await connection.timeUntilEventEnd(eventName, optionalLocation);
};


exports.timeUntilEvent = function(eventName){
    return new Date('2020-03-30T16:00:00');
};


exports.saveScore = function(eventName, gameName, teamName, score){
    if(!exports.doesTeamExist(eventName, teamName)){
        exports.registerTeam(eventName, teamName);
    }

    return true;
};


exports.voteImage = (eventName, imageNumber) => {
    return true;
}


exports.requestSoonestEvent = (date) => {
    return "hw";
};


exports.locationOfEvent = (eventName) => {
    return 'https://goo.gl/maps/QoBwqdFx8rqe2Gpb9';
};



exports.requestTopScore = function(eventName, gameName, scoreFor){
    return [ { name: "BestTeam", score:124 }, { name:"AlmostBest", score:122} ];
};


exports.doesTeamExist = (eventName, teamName) => {
    return false;
};


exports.registerTeam = (eventName, teamName) => {

    return true;
};


exports.requestAllGames = function(eventName){
    return [ {name:"funGame"  }, { name: "Quidditch"} ];
};


exports.requestEventName = function(){
    return eventName;
};