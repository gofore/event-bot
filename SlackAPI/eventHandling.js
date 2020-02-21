const {directMention} = require("@slack/bolt");
const {
        timeUntilEvent, timeUntilEventEnd, saveScore, requestEventName, registerTeam, locationOfEvent,
        requestSoonestEvent, requestTopScore, requestAllGames, voteImage
      } = require('./eventConnection');
const {homePageRegistering} = require('./eventRegistrations/registerHomePage');

const eventName = requestSoonestEvent(Date.now());

const splitMentionMessage = (message) => {
  let split = message.text.split(' ');
  if(split[0].includes('@')){
    split = split.slice(1);
  }
  return split;
};


const parseInteger = (stringFormattedNumber) => {
  //TODO: safeguards
  parseInt(stringFormattedNumber);
}


const sayTimeUntil = (say, millisecondsUntil) => {
  const timeInDays = millisecondsUntil / 1000 / 60 / 60 / 24;
  say(`Time until event is ${millisecondsUntil} milliseconds or ${timeInDays.toFixed(2)} days`);
}


exports.registerEvents = (app) => {
  //This is a bit unreadable but will in the future allow using the same lambdas for multiple different event listeners
  const registereableMessageEvents = [
    {
      directMention: true,
      query: /eta|ETA/,
      lambda:
      async ({ say, context }) => {
        const timeUntil = timeUntilEvent(requestEventName()) - Date.now();
        sayTimeUntil(say, timeUntil);
      },
      help: "[eta] to see how much time left for the event."
    },
    {
      directMention: true,
      query: /score .+ .+ \d+$/,
      lambda:
      async ({ message, say, context }) => {
        const params = splitMentionMessage(message);
        const gameName = params[1];
        const teamName = params[2];
        const score = parseInteger(params[3]);
        if(isNaN(score)){
          say('The third parameter needs to be a number representing the score');
          return;
        }
        if (saveScore(requestEventName(), gameName, teamName, score)) {
          say(':+1:');
        }
        else {
          say('Score saving failed');
        }
      },
      help: "[score _gameName_ _teamName_ _score_] to register scores for a game you participateed. Score should be in number format."
    },
    {
      directMention: true,
      query: /score .+$/,
      lambda:
      async ({ message, say, context }) => {
        say('Nice to meet you my old fiend. Let\'s score! :)');
        try{
          
        }catch(error){
          console.error(error);
        }
      }
    },
    {
      directMention:true,
      query: /register .+/,
      lambda:
      async ({ message, say, context }) => {
        const params = splitMentionMessage(message);
        const teamName = params[1];
        if (registerTeam(teamName)) {
          say('Team registered succesfully with name ' + teamName);
        }
        else {
          say(`Name ${teamName} was not available`);
        }
      },
      help:"[register _teamName_} to register a team"
    },
    {
      directMention:true,
      query: /loc[ation]{0,5}$/,
      lambda:
      async ({ say, context }) => {
        const locationLink = locationOfEvent(requestEventName());
        say(`${locationLink}`);
      },
      help: "[location] shows where the event is located."
    },
    {
      directMention: true,
      query: /tops?$/,
      lambda:
      async ({ message, say, context }) => {
        showAllGameScores(say, 5);
      },
      help: "[top] or [tops] lists the top 5 teams of every game."
    },
    {
      directMention: true,
      query: /tops? [\d].*/,
      lambda:
      async ({ message, say, context }) => {
        //Message should always be '@bot top number'
        const params = splitMentionMessage(message);
        const topsRequested = parseInteger(params[1]);
        const gameRequested = params.length > 2 ? params[2] : null;
        if (gameRequested) {
          showSingleGamesScores(say, gameRequested, topsRequested);
        }
        else {
          showAllGameScores(say, topsRequested);
        }
      },
      help:`[top _number_] or [tops _number_ _gameName_]. Shows top scores for all the matching games.`
    },
    {
      directMention: true,
      query: /vote \d+/,
      lambda:
      async ({message, say, context}) => {
        const params = splitMentionMessage(message);
        const imageNumber = parseInteger(params[1]);
        if(voteImage(requestEventName(), imageNumber)) { //TODO: slack id?
          say('You voted image succesfully');
        }
      },
      help: "[vote _number_] allows you to register your vote for a image. Number is the image you wish to vote for."
    },
    {
      directMention: true,
      query: /end/,
      lambda:
      async ({message, say, context}) => {
        const params = splitMentionMessage(message);
        let location = null;
        if(params.length > 1){
          location = params[1];
        }
        const timeUntil = timeUntilEventEnd(requestEventName(), location) - Date.now();
        sayTimeUntil(say, timeUntil);
      },
      help: "[end] or [end _location_] can be used to showcase ending time of event for a certain travel destination if provided"
    },
    {
      directMention: true,
      query: /help/,
      lambda:
      async ({message, say, context}) => {
        helpMentioned(say, this.registereableMessageEvents);
      },
      help: "[help] informs user with all the possible commands available."
    }
];
  this.registereableMessageEvents = registereableMessageEvents;


  app.event('app_mention', async ({event, context, say}) => {
    console.log(say);
    const message = event.text;
    const sayFunc = (msg) => {
      const result = await app.client.chat.postMesssage({
        token: context.botToken,
        channel: event.channel,
        text: msg
      });
    };

    registereableMessageEvents.forEach(command => {
      if(message.match(command.query)){
        event.lambda({message, say: sayFunc});
      }
    })
  });

  registereableMessageEvents.forEach(event => {
    if(event.directMention){
      app.message(directMention(), event.query, event.lambda);
    }
    else{
      app.message(event.query, event.lambda);
    }    
  });

  //etaMessageMentioned(app);
  helpMentioned(app, registereableMessageEvents);

  app.event('app_mention', async ({message, say}) => {
    console.log('I was noticed in chat!');
  });

  homePageRegistering(app);
}


function helpMentioned(app, events) {
  let helpText = "My job is to inform you about event details and to allow participating in different event activities.\n";

  events.forEach(element => {
    if(element.help){
      helpText += element.help + '\n';
    }
  });

  helpText += "Currently I am configured to answer to @my-name commands only.\n"
  say(helpText);
}


function scoreCommand(app) {
  app.command('/score', async ({ command, ack, say }) => {
    ack();
    const params = command.text.split(' ');
    if (params.length < 3) {
      say('The command probably was not formatted properly');
      return;
    }
    const teamName = params[0];
    const gameName = params[1];
    const score = parseInteger(params[2]);
    if (isNaN(score)) {
      say('Please input score as a number');
      return;
    }
    if (saveScore(requestEventName(), gameName, teamName, score)) {
      say(`Saved score of ${score} to ${teamName} in ${gameName}`);
    }
    else {
      say('Score was not saved for some reason');
    }
  });
}

const showSingleGamesScores = (say, gameRequested, topsRequested) => {
  const topScores = requestTopScore(requestEventName(), gameRequested, topsRequested);

  if(Boolean(topScores)){
    let scores = '';

    topScores.forEach(element => {
      scores += '    '+element.name + ' with score ' + element.score+'\n';
    });

    say(`Tops are for ${gameRequested}:\n${scores}`);
  }
  else{
    say('Top list was not able to be retreived with the parameters given');
  }
};


const showAllGameScores = (say, topsRequested) => {
    const games = requestAllGames(requestEventName());

    games.forEach(element => {
        showSingleGamesScores(say, element.name, topsRequested);
    });
}

