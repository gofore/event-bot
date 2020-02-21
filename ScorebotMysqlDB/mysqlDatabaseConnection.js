const mysql = require('mysql');

const isLogging = false;

exports.DatabaseConnection = class DatabaseConnection{

    constructor(){
        this.connection = mysql.createConnection({
            host: 'localhost',
            // ssl: 'fetchThisStill',
            user: 'dev',
            password: '',
            database: 'event_db'
        });
    }

    doQuery = (query, queryParams, callback) => {
        //This does not require open and end
        this.connection.query(query, queryParams, (err, results, fields) => {
            if(err){
                if(isLogging){
                    console.error(err);
                }
                throw err;
            }
            if(isLogging){
                console.log(`Results were ${results}`);
                console.log(`Fields were ${fields}`);
            }
    
            callback(results, fields);
        })
    }


    findSoonestEvent(callback){
        this.doQuery(`
            SELECT event_name, starting_date 
            FROM events
            ORDER BY starting_date ASC`, [], callback);
    }


    queryTimeUntilEventEnd = (eventName, optionalLocation, callback) => {
        if(Boolean(optionalLocation)){
            this.doQuery(`
                SELECT e.e
                FROM endings e
                INNER JOIN events ev
                    USING (event_id)
                WHERE events.event_name = ? AND e.location = ?`,[eventName, optionalLocation], callback);
        }
        else{
            this.doQuery(`
                SELECT e.e
                FROM endings e
                INNER JOIN events ev
                    USING (event_id)
                WHERE events.event_name = ? AND e.location = ''`,[eventName], callback);
        }
    };
    

    queryDateFor = (eventName, callback) => {
        this.doQuery("SELECT e.starting_date FROM events e WHERE e.event_name = ?", [eventName], callback);
    }
    

    saveScore = (eventName, gameName, teamName, score, callback) => {
        //TODO: check team existance before trying to add?
        this.doQuery(`
            INSERT INTO teams_games (team_id, game_id, score)
            SELECT t.team_id, g.game_id, ?
            FROM teams t, games g
            INNER JOIN events e
                USING (event_id)
            WHERE t.team_name = ? AND g.name = ? AND e.event_name = ?`, [score, teamName, gameName, eventName], callback);
    }
    

    voteFor = (eventName, slackId, imageNumber, callback) => {
        this.doQuery(`
            INSERT INTO votes (event_id, slack_id, vote)
            SELECT event_id, ?, ?
            FROM events
            WHERE event_name = ?`, [slackId, imageNumber, eventName], callback);
    }


    requestAllVotes = (eventName, callback) => {
        this.doQuery(`
            SELECT v.vote, count(*) as NUM
            FROM votes v            
            INNER JOIN events e
                USING(event_id)
            WHERE e.event_name = ?
            GROUP BY vote
            ORDER BY NUM DESC
        `, [eventName], callback);
    }


    registerTeam = (eventName, teamName, callback) => {
        this.doQuery(`
            INSERT INTO teams (event_id, team_name)
            SELECT * FROM (SELECT event_id, ? FROM events WHERE event_name = ?) AS tmp
            WHERE NOT EXISTS (
                SELECT team_name
                FROM teams
                INNER JOIN events e
                    USING(event_id)
                WHERE team_name = ? AND event_name = ?
            ) LIMIT 1`, [teamName, eventName, teamName, eventName], callback);
    } 

    

    requestAllGames = (eventName, callback) => {
        this.doQuery(`
            SELECT g.game_id, g.name
            FROM games g
            INNER JOIN events e USING (event_id)
            WHERE e.event_name = ?
            `, [eventName], callback);
    }



    checkIfTeamExists = (eventName, teamName, callback) => {
        this.doQuery(`
            SELECT *
            FROM teams t
            INNER JOIN events e
               ON t.event_id = e.event_id
                   AND e.event_name = ?
            WHERE t.team_name = ?`, [eventName, teamName], callback);
    }

    
    requestTopScoreFor = (eventName, gameName, callback) => {
        this.doQuery(`
            SELECT t.team_name, g.name, tg.score
            FROM teams_games tg
            INNER JOIN teams t
                ON t.team_id = tg.team_id
            INNER JOIN games g
                ON g.game_id = tg.game_id
            INNER JOIN events e
                ON e.event_id = g.event_id
                AND e.event_id = t.event_id
            WHERE g.name = ? AND e.event_name = ?
            ORDER BY tg.score DESC
        `, [gameName, eventName], callback)
    }

    
    requestAllTopScores = function(eventName, callback){
        this.doQuery(`
            SELECT t.team_name, g.name, tg.score
            FROM teams_games tg
            INNER JOIN teams t
                ON t.team_id = tg.team_id
            INNER JOIN games g
                ON g.game_id = tg.game_id
            INNER JOIN events e
                ON e.event_id = g.event_id
                AND e.event_id = t.event_id
            WHERE e.event_name = ?
            ORDER BY g.name ASC, tg.score DESC
        `, [eventName], callback);
    };


    requestCorrectAnswerSetFor = (eventName, gameName, callback) => {
        this.doQuery(`
            SELECT json_answerset
            FROM correct_answers ca
            INNER JOIN games g
                ON ca.game_id = g.game_id
            INNER JOIN events e
                ON e.event_id = g.event_id
            WHERE e.event_name = ? AND g.name = ?
        `, [eventName, gameName], callback);
    }


    requestEventLocation = (eventName, callback) => {
        this.doQuery(`
            SELECT location
            FROM events
            WHERE event_name = ?
        `, [eventName], callback);
    }
}