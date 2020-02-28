// const databaseConnection = require('./mysqlDatabaseConnection');

const eventName = "hw";


exports.timeUntilEventEnd = (eventName, optionalLocation) => {
    if(Boolean(optionalLocation)){
        return new Date('2020-03-30T22:00:00');
    }
    return new Date('2020-03-30T24:00:00');
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


exports.voteImage = (eventName, categoryName, slackId, imageNumber) => {
    return true;
}

exports.requestAllCategories = (eventName) => {
    return [{ category_id: 1, category_name: 'Asia asu' }, { category_id: 2, category_name: 'Ei tod asu' }];
}

exports.voteByCategoryId = (categoryId, slackId, imageNumber) => {
    return true;
}


exports.requestSoonestEvent = (date) => {
    return "hw";
};


exports.locationOfEvent = (eventName) => {
    return 'https://goo.gl/maps/QoBwqdFx8rqe2Gpb9';
};



exports.requestTopScore = (eventName, gameName, scoreFor) => {
    return [ { 
        team_id: 2,
        team_name: 'Huuhkajat',
        score: 1324
      },
      {
        team_id: 1,
        team_name: 'Testaajat',
        score: 1212
      },
    {
        team_id: 3,
        team_name: 'Muuntajat',
        score: 728
      }];
};


exports.requestAllScores = (eventName) => {
    return [ {
        team_name: 'Huuhkajat',
        game_name: 'Speden spelit',
        score: 1462
      },
      {
        team_name: 'Testaajat',
        game_name: 'Speden spelit',
        score: 1212
      },
      {
        team_name: 'Muuntajat',
        game_name: 'Hula hula',
        score: 649
      }];
}


exports.doesTeamExist = (eventName, teamName) => {
    return false;
};


exports.registerTeam = (eventName, teamName) => {

    return true;
};


exports.requestAllGames = function(eventName){
    return [ { game_id: 1, game_name: 'speden spelit' }, { game_id: 2, game_name: 'mega mäiske' }, { game_id: 3, game_name: 'aivan jotain muuta' } ];
};


exports.requestAllTeams = function(eventName){
    return [{ team_id: 1, team_name: 'Huuhkajat' }, { team_id: 2, team_name: 'Mörrit' }];
}


exports.requestEventName = function(){
    return eventName;
};