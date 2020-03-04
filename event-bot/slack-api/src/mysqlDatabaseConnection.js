const mysql = require('mysql');
const { promisify } = require('util');

const isLogging = false;

exports.DatabaseConnection = class DatabaseConnection {

    constructor() {
        this.connection = mysql.createConnection({
            host: 'event-db.cyocfpjf05my.eu-west-1.rds.amazonaws.com',
            // ssl: 'fetchThisStill',
            user: 'admin',
            password: process.env.DB_PASSWORD,
            database: 'eventdb'
        });

        this.connection.query[promisify.custom] = (query, queryParams) => new Promise((resolve, reject) => {
            if (process.env.DEBUG_LOGS) {
                console.log(`Starting query ${query}`);
            }
            this.connection.query(query, queryParams, (err, results, fields) => {
                if (err) {
                    if (process.env.DEBUG_LOGS) {
                        console.error(err);
                    }
                    reject(err);
                }
                else {
                    if (process.env.DEBUG_LOGS) {
                        console.log('Query succeeded');
                    }
                    resolve(results);
                }
            })
        });
        this.queryWithPromise = promisify(this.connection.query);
    }


    startConnection = () => {
        this.connection.connect(err => {
            if (process.env.DEBUG_LOGS) {
                console.error(err);
            }
        });
    }


    /**
     * If you use start connection, also dispose it with endConnection, connections can be started implicitly too
     */
    endConnection = () => {
        this.connection.end(err => {
            if (process.env.DEBUG_LOGS) {
                console.error(err);
            }
        })
    }


    doQuery = (query, queryParams) => {
        //This does not require open and end. Hopefully it still ends with promise too..
        return this.queryWithPromise(query, queryParams);
    }


    findSoonestEvent() {
        return this.doQuery(`
            SELECT event_name, long_name, starting_date 
            FROM event
            ORDER BY starting_date ASC`, []);
    }


    queryTimeUntilEventEnd = (eventName, optionalLocation) => {
        if (Boolean(optionalLocation)) {
            return this.doQuery(`
                SELECT e
                FROM ending e
                INNER JOIN event ev
                    USING (event_id)
                WHERE ev.event_name = ? AND e.location = ?`, [eventName, optionalLocation]);
        }
        else {
            return this.doQuery(`
                SELECT e.e
                FROM ending e
                INNER JOIN event ev
                    USING (event_id)
                WHERE ev.event_name = ? AND e.location = ''`, [eventName]);
        }
    };


    queryDateFor = (eventName) => {
        return this.doQuery("SELECT e.starting_date FROM event e WHERE e.event_name = ?", [eventName]);
    }


    saveScoreById = (eventName, gameId, teamId, score) => {
        return this.doQuery(`
            INSERT INTO team_game (team_id, game_id, score)
            SELECT ?, ?, ?
            FROM event e
                INNER JOIN team t
                    USING (event_id)      
                INNER JOIN game g
                    USING (event_id)
            WHERE e.event_name = ?
                ON DUPLICATE KEY UPDATE score = VALUES(score)`, [teamId, gameId, score, eventName, score]);

    }


    saveScore = (eventName, gameName, teamName, score) => {
        //TODO: check team existance before trying to add?
        return this.doQuery(`
            INSERT INTO team_game (team_id, game_id, score)
            SELECT t.team_id, g.game_id, ?
            FROM event e
                INNER JOIN team t
                    USING (event_id)      
                INNER JOIN game g
                    USING (event_id)
            WHERE t.team_name = ? AND g.game_name = ? AND e.event_name = ?
                ON DUPLICATE KEY UPDATE score = VALUES(score)`, [score, teamName, gameName, eventName]);
    }


    voteFor = (eventName, categoryName, slackId, imageNumber) => {
        return this.doQuery(`
            INSERT INTO vote (category_id, slack_id, vote)
            SELECT c.category_id, ?, ?
            FROM category c
                INNER JOIN event e
                USING (event_id)
            WHERE event_name = ? AND c.category_name = ?`, [slackId, imageNumber, eventName, categoryName]);
    }


    voteById = (categoryId, slackId, imageNumber) => {
        return this.doQuery(`
            INSERT INTO vote (category_id, slack_id, vote)
            VALUES(?, ?, ?)
                ON DUPLICATE KEY UPDATE vote = VALUES(vote)`, [categoryId, slackId, imageNumber]);
    }


    requestAllCategories = (eventName) => {
        return this.doQuery(`
            SELECT c.category_id, c.category_name
            FROM category c
            INNER JOIN event e
                USING(event_id)
            WHERE e.event_name = ?
        `, [eventName]);
    }


    requestAllVotes = (eventName) => {
        return this.doQuery(`
            SELECT v.vote, count(*) as NUM
            FROM vote v            
            INNER JOIN event e
                USING(event_id)
            WHERE e.event_name = ?
            GROUP BY vote
            ORDER BY NUM DESC
        `, [eventName]);
    }


    registerTeam = (eventName, teamName) => {
        return this.doQuery(`
            INSERT INTO team (event_id, team_name)
            SELECT * FROM (SELECT event_id, ? FROM event WHERE event_name = ?) AS tmp
            WHERE NOT EXISTS (
                SELECT team_name
                FROM team
                INNER JOIN event e
                    USING(event_id)
                WHERE team_name = ? AND event_name = ?
            ) LIMIT 1`, [teamName, eventName, teamName, eventName]);
    }



    requestAllGames = (eventName) => {
        return this.doQuery(`
            SELECT g.game_id, g.game_name
            FROM game g
            INNER JOIN event e USING (event_id)
            WHERE e.event_name = ?
            `, [eventName]);
    }


    requestAllTeams = (eventName) => {
        return this.doQuery(`
            SELECT t.team_id, t.team_name
            FROM team t
            INNER JOIN event e
                USING (event_id)
            WHERE e.event_name = ?`, [eventName]);
    }



    findTeamsWithName = (eventName, teamName) => {
        return this.doQuery(`
            SELECT *
            FROM team t
            INNER JOIN event e
               ON t.event_id = e.event_id
                   AND e.event_name = ?
            WHERE t.team_name = ?`, [eventName, teamName]);
    }


    requestTopScoreFor = (eventName, gameName) => {
        return this.doQuery(`
            SELECT t.team_id, t.team_name, tg.score
            FROM team_game tg
            INNER JOIN team t
                ON t.team_id = tg.team_id
            INNER JOIN game g
                ON g.game_id = tg.game_id
            INNER JOIN event e
                ON e.event_id = g.event_id
                AND e.event_id = t.event_id
            WHERE g.game_name = ? AND e.event_name = ?
            ORDER BY tg.score DESC
        `, [gameName, eventName])
    }


    requestAllTopScores = function (eventName) {
        return this.doQuery(`
            SELECT t.team_name, g.game_name, tg.score
            FROM team_game tg
            INNER JOIN team t
                ON t.team_id = tg.team_id
            INNER JOIN game g
                ON g.game_id = tg.game_id
            INNER JOIN event e
                ON e.event_id = g.event_id
                AND e.event_id = t.event_id
            WHERE e.event_name = ?
            ORDER BY g.game_name ASC, tg.score DESC
        `, [eventName]);
    };


    requestCorrectAnswerSetFor = (eventName, gameName, ) => {
        return this.doQuery(`
            SELECT json_answerset
            FROM correct_answer ca
            INNER JOIN game g
                ON ca.game_id = g.game_id
            INNER JOIN event e
                ON e.event_id = g.event_id
            WHERE e.event_name = ? AND g.game_name = ?
        `, [eventName, gameName]);
    }


    requestEventLocation = (eventName) => {
        return this.doQuery(`
            SELECT location
            FROM event
            WHERE event_name = ?
        `, [eventName]);
    }
}