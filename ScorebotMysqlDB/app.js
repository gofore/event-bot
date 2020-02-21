const {DatabaseConnection} = require('./mysqlDatabaseConnection.js');

const eventName = 'hw';

const db = new DatabaseConnection();

// db.checkIfTeamExists(eventName, 'Mörrit', (results, fields) => {
//     if(results.length === 1){
//         console.log(`Team ${results[0].team_name} was found`);
//         console.log(results);
//     }
// })


// db.voteFor(eventName, Math.random(0, Number.MAX_SAFE_INTEGER), 12, (results) => {
//     console.log('voted succesfully');
// })
//db.registerTeam('hw', 'Voittajat', ()=>{});
// db.registerTeam('e15', 'Testaajat', (results)=>{
//     console.log(results);
// });

db.requestAllVotes('e15', (results) => {
    results.forEach(element => {
        console.log(element);
    });
});

// db.requestAllGames('e15', (results) => {
//     results.forEach(element => {
//         console.log(element);
//     });
// });


// db.requestCorrectAnswerSetFor('hw', 'aivan jotain muuta', (results) => {
//     results.forEach(element => {
//         console.log(element.json_answerset);
//     });
// })

// db.requestEventLocation('hw', (results) => {
//     results.forEach(element => {
//         console.log(element);
//     });
// })
// db.saveScore('hw', 'aivan jotain muuta', 'Kakkoset', 222, (result) => {
//     console.log('score saved!');
// });

// db.saveScore('speden spelit', 'Viiskytä Viis', 11, (result) => {
//     console.log('score saved!');
// });

// db.saveScore('e15', 'musavisa', 'Testaajat', 8, (result) => {
//     console.log('score saved!');
// });


// db.saveScore('speden spelit', 'Kakkoset', 240, (result) => {
//     console.log('score saved!');
// });
 
// db.requestTopScoreFor('hw', 'speden spelit', (results) => {
//     results.forEach(gameScore => {
//         console.log(gameScore);
//     });
// });
db.findSoonestEvent((results) => {
    results.forEach(gameScore => {
        console.log(gameScore);
    });
});
