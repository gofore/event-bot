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


db.requestAllGames('hw').then(results => {
    results.forEach(element => {
        console.log(element);
    });
});
// db.saveScore('hw', 'aivan jotain muuta', 'Kakkoset', 222, (result) => {
//     console.log('score saved!');
// });

db.registerTeam(eventName, 'Testaajat').then(result => {
    console.log(result);
})

db.registerTeam(eventName, 'Huuhkajat').then(result => {
    console.log(result);
})


// db.saveScore('hw', 'Speden spelit', 'Huuhkajat', 195).then((result) => {
//     console.log(result);
// });

// db.saveScore('hw', 'speden spelit', 'Testaajat', 15).then((result) => {
//     console.log(result);
// });


db.saveScoreById('hw', 1, 2, 111).then(result => {
    console.log(result);
})

// db.saveScore('speden spelit', 'Kakkoset', 240, (result) => {
//     console.log('score saved!');
// });
 
db.requestTopScoreFor('hw', 'speden spelit').then(results => {
    results.forEach(gameScore => {
        console.log(gameScore);
    });
});
// db.findSoonestEvent().then((results) => {
//     results.forEach(gameScore => {
//         console.log(gameScore);
//     });
// });
