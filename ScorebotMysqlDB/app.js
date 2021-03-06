const {DatabaseConnection} = require('../event-bot/slack-api/src/mysqlDatabaseConnection');

const eventName = 'hw';

const db = new DatabaseConnection();

const randomInt = (min, max) => {
    return min + Math.floor(Math.random() * max);
};

// db.checkIfTeamExists(eventName, 'Mörrit', (results, fields) => {
//     if(results.length === 1){
//         console.log(`Team ${results[0].team_name} was found`);
//         console.log(results);
//     }
// })


// db.voteFor(eventName, Math.random(0, Number.MAX_SAFE_INTEGER), 12, (results) => {
//     console.log('voted succesfully');
// })
// db.registerTeam('hw', 'Myyrät').then(()=>{});

// db.requestAllVotes('e15').then(results => {
//     results.forEach(element => {
//         console.log(element);
//     });
// });

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

// db.requestEventLocation('hw').then((results) => {
//     results.forEach(element => {
//         console.log(element);
//     });
// })

db.requestAllTeams('hw').then(results => {
    results.forEach(element => {
        console.log(element);
    });
}) ;


// db.requestAllGames('hw').then(results => {
//     results.forEach(element => {
//         console.log(element);
//     });
// });
// db.saveScore('hw', 'aivan jotain muuta', 'Kakkoset', 222, (result) => {
//     console.log('score saved!');
// });

db.registerTeam(eventName, 'Uusi').then(result => {
    console.log(result);
})


// for (let index = 0; index < 10; index++) {
//     const name = (Math.random() * 1255).toString(36).substring(randomInt(5, 11));
//     console.log(name);
//     db.registerTeam(eventName, name).then(result => {
//         console.log(result);
//     })
// }

// db.saveScore('hw', 'Speden spelit', 'Huuhkajat', 195).then((result) => {
//     console.log(result);
// });
db.requestAllTeams('hw').then(results => {
    results.forEach(element => {
        console.log(element);
    });
}) ;

db.voteFor('hw', 'Asia asu', '123123123', 15).then(result => {
    console.log(result);
})

// db.requestAllCategories(eventName).then(result => {
//     result.forEach(element => {
//         console.log(element);
//     });

//     const randomCategory = result[randomInt(0, result.length)];
//     return db.voteById(randomCategory.category_id, randomInt(1, 20), randomInt(1, 20));
// }).then(result => {
//     // console.log(result);
// });

// db.findSoonestEvent('hw').then((result) => {
//     console.log(result);
// });
// db.saveScore('hw', 'speden spelit', 'Huuhkajat', randomInt(1, 1500)).then((result) => {
//     console.log(result);
// });


// db.saveScoreById('hw', 1, 3, randomInt(1, 1500)).then(result => {
//     console.log(result);
// })


// db.requestTopScoreFor('hw', 'speden spelit').then(results => {
//     results.forEach(gameScore => {
//         console.log(gameScore);
//     });
// });

// db.requestAllTopScores(eventName).then(results => {
//     results.forEach(scorePackage => {
//         console.log(scorePackage);
//     });
// });
// db.findSoonestEvent().then((results) => {
//     results.forEach(gameScore => {
//         console.log(gameScore);
//     });
// });
